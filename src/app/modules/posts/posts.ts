import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { SelectComponent, type SelectOption } from '../../shared/components/select';
import { PostService, type Post, type PostTag, type Tag, type User } from './services/post.service';
import { PostComponent } from './components/post';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toast } from 'ngx-sonner';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'rh-posts',
  template: `
    <div class="space-y-4 md:space-y-6 pb-8">
      <h2 class="text-2xl md:text-4xl font-extrabold">{{ 'posts.listTitle' | translate }}</h2>

      <div class="flex flex-col md:flex-row gap-3 md:gap-4 md:justify-between md:items-center">
        <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div class="w-full sm:w-48 md:w-64">
            <rh-select
              [options]="authorOptions()"
              [value]="selectedAuthor()"
              (valueChange)="onAuthorChange($event)"
              [placeholder]="'posts.filterByAuthor' | translate"
              [searchable]="true"
            />
          </div>

          <div class="w-full sm:w-48 md:w-64">
            <rh-select
              [options]="tagOptions()"
              [value]="selectedTag()"
              (valueChange)="onTagChange($event)"
              [placeholder]="'posts.filterByTag' | translate"
              [searchable]="true"
            />
          </div>
        </div>

        <p class="text-xs md:text-sm text-gray-600 whitespace-nowrap">
          {{ 'posts.showing' | translate }} {{ posts().length }} {{ 'posts.of' | translate }}
          {{ total() }} {{ 'posts.results' | translate }}
        </p>
      </div>

      <div class="grid gap-4">
        @if (loading() && posts().length === 0) {
          <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        } @else {
          @for (post of posts(); track post.id) {
            <rh-post
              [id]="post.id"
              [title]="post.title"
              [author]="post.user?.name || 'Unknown'"
              [createdAt]="post.createdAt"
              [tags]="getTagNames(post.postTags)"
              [content]="post.content"
            />
          } @empty {
            <p class="text-gray-500 text-center py-8">{{ 'posts.noPostsFound' | translate }}</p>
          }

          @if (loading() && posts().length > 0) {
            <div class="flex justify-center py-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        }
      </div>
    </div>
  `,
  imports: [SelectComponent, PostComponent, TranslateModule],
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class PostsComponent implements OnInit {
  private postService = inject(PostService);
  private translateService = inject(TranslateService);
  private searchService = inject(SearchService);

  private searchSubject = new Subject<string>();
  private searchQuery = signal('');
  private tagsList = signal<Tag[]>([]);
  private authorsList = signal<User[]>([]);
  private readonly pageSize = 4;
  private currentPage = signal(1);

  public posts = signal<Post[]>([]);
  public total = signal(0);
  public loading = signal(false);
  public selectedAuthor = signal<string | number | null>(null);
  public selectedTag = signal<number | null>(null);
  public authorOptions = signal<SelectOption[]>([]);
  public tagOptions = signal<SelectOption[]>([]);

  public hasMore = computed(() => this.posts().length < this.total());

  public constructor() {
    this.searchSubject.pipe(debounceTime(300)).subscribe({
      next: (search) => {
        this.searchQuery.set(search);
        this.resetAndLoad();
      },
      error: () => toast.error(this.translateService.instant('common.error')),
    });

    effect(() => {
      const query = this.searchService.searchQuery();
      this.searchSubject.next(query);
    });
  }

  public ngOnInit(): void {
    this.loadInitialData();
  }

  public onAuthorChange(authorId: string | number | null): void {
    this.selectedAuthor.set(authorId);
    this.resetAndLoad();
  }

  public onTagChange(tagId: string | number | null): void {
    const numericTagId = tagId !== null ? Number(tagId) : null;
    this.selectedTag.set(numericTagId);
    this.resetAndLoad();
  }

  public onScroll(): void {
    if (this.loading() || !this.hasMore()) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      this.currentPage.update((page) => page + 1);
      this.loadPage(/* append */ true);
    }
  }

  public getTagNames(postTags: PostTag[] | undefined): string[] {
    if (!postTags || !Array.isArray(postTags)) return [];
    return postTags
      .map((postTag) => postTag.tag?.name ?? '')
      .filter((name): name is string => name.length > 0);
  }

  private loadInitialData(): void {
    this.loading.set(true);
    forkJoin({
      page: this.postService.getPosts({ page: 1, pageSize: this.pageSize }),
      authors: this.postService.getAuthors(),
      tags: this.postService.getTags(),
    }).subscribe({
      next: ({ page, authors, tags }) => {
        this.posts.set(page.items);
        this.total.set(page.total);
        this.authorsList.set(authors);
        this.tagsList.set(tags);
        this.updateSelectOptions();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error(this.translateService.instant('common.error'));
      },
    });

    this.translateService.onLangChange.subscribe({
      next: () => this.updateSelectOptions(),
      error: () => toast.error(this.translateService.instant('common.error')),
    });
  }

  private resetAndLoad(): void {
    this.currentPage.set(1);
    this.loadPage(/* append */ false);
  }

  private loadPage(append: boolean): void {
    this.loading.set(true);
    this.postService
      .getPosts({
        search: this.searchQuery() || undefined,
        userId: (this.selectedAuthor() as number) || undefined,
        tagId: this.selectedTag() || undefined,
        page: this.currentPage(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (page) => {
          this.total.set(page.total);
          if (append) {
            this.posts.update((list) => [...list, ...page.items]);
          } else {
            this.posts.set(page.items);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          toast.error(this.translateService.instant('common.error'));
        },
      });
  }

  private updateSelectOptions(): void {
    this.authorOptions.set([
      { label: this.translateService.instant('posts.allAuthors'), value: null },
      ...this.authorsList().map((author) => ({
        label: this.capitalize(author.name),
        value: author.id,
      })),
    ]);

    this.tagOptions.set([
      { label: this.translateService.instant('posts.allTags'), value: null },
      ...this.tagsList().map((tag) => ({
        label: tag.name,
        value: tag.id,
      })),
    ]);
  }

  private capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
