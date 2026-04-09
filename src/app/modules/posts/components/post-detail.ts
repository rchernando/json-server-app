import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArrowLeft, Edit, LucideAngularModule, Trash2 } from 'lucide-angular';
import { toast } from 'ngx-sonner';

import { PostService, type Post } from '../services/post.service';
import { CommentsSectionComponent } from './comments-section';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../auth/service/auth.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { canUserManage } from '../../../core/auth/ownership';

@Component({
  selector: 'rh-post-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-8 px-4 md:px-0">
      <button
        type="button"
        (click)="goBack()"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base"
      >
        <lucide-icon [img]="arrowLeftIcon" [size]="18"></lucide-icon>
        <span>{{ 'postDetail.back' | translate }}</span>
      </button>

      @if (post(); as currentPost) {
        <article class="space-y-4 md:space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
            <div class="flex-1 min-w-0">
              <h1
                class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4 break-words"
              >
                {{ currentPost.title }}
              </h1>
              <div class="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <span class="font-medium">{{ currentPost.user?.name ?? '' | capitalize }}</span>
                <span>•</span>
                <span>{{ currentPost.createdAt | dateFormat }}</span>
              </div>
            </div>

            @if (canManagePost()) {
              <div class="flex gap-2 shrink-0">
                <button
                  type="button"
                  (click)="onEditPost()"
                  class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                  [title]="'postDetail.edit' | translate"
                >
                  <lucide-icon [img]="editIcon" [size]="16"></lucide-icon>
                </button>
                <button
                  type="button"
                  (click)="onDeletePost()"
                  [disabled]="deleting()"
                  class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  [title]="'postDetail.delete' | translate"
                >
                  <lucide-icon [img]="trashIcon" [size]="16"></lucide-icon>
                </button>
              </div>
            }
          </div>

          <div class="prose prose-sm md:prose-lg max-w-none">
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {{ currentPost.content }}
            </p>
          </div>

          @if (currentPost.postTags && currentPost.postTags.length > 0) {
            <div class="flex flex-wrap gap-2">
              @for (postTag of currentPost.postTags; track postTag.id) {
                <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {{ postTag.tag?.name }}
                </span>
              }
            </div>
          }
        </article>

        @defer (on viewport; prefetch on idle) {
          <rh-comments-section [postId]="currentPost.id" />
        } @placeholder {
          <div class="text-sm text-gray-400 text-center py-8">
            {{ 'postDetail.commentsHidden' | translate }}
          </div>
        } @loading (minimum 200ms) {
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      } @else if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      } @else {
        <p class="text-gray-500 text-center py-8">
          {{ 'common.error' | translate }}
        </p>
      }
    </div>
  `,
  imports: [
    TranslateModule,
    LucideAngularModule,
    CapitalizePipe,
    DateFormatPipe,
    CommentsSectionComponent,
  ],
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);

  public post = signal<Post | null>(null);
  public loading = signal(false);
  public deleting = signal(false);

  public readonly arrowLeftIcon = ArrowLeft;
  public readonly trashIcon = Trash2;
  public readonly editIcon = Edit;

  public canManagePost = computed(() => canUserManage(this.post(), this.authService.currentUser()));

  public ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      this.goBack();
      return;
    }

    this.loading.set(true);
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error(this.translateService.instant('common.error'));
      },
    });
  }

  public onEditPost(): void {
    const post = this.post();
    if (!post) return;
    this.router.navigateByUrl(this.languageService.localize(`/posts/${post.id}/edit`));
  }

  public onDeletePost(): void {
    const post = this.post();
    if (!post || this.deleting()) return;

    const confirmed = window.confirm(this.translateService.instant('postDetail.confirmDelete'));
    if (!confirmed) return;

    this.deleting.set(true);
    this.postService.deletePost(post.id).subscribe({
      next: () => {
        this.deleting.set(false);
        toast.success(this.translateService.instant('postDetail.deleted'));
        this.router.navigateByUrl(this.languageService.localize('/'));
      },
      error: () => {
        this.deleting.set(false);
        toast.error(this.translateService.instant('common.error'));
      },
    });
  }

  public goBack(): void {
    this.router.navigateByUrl(this.languageService.localize('/'));
  }
}
