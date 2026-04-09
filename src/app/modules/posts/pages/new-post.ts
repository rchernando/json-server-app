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
import { form, FormField, required } from '@angular/forms/signals';
import { toast } from 'ngx-sonner';
import { switchMap } from 'rxjs/operators';

import { ButtonComponent } from '../../../shared/components/button';
import { PostService } from '../services/post.service';
import { AuthService } from '../../auth/service/auth.service';
import { LanguageService } from '../../../core/i18n/language.service';

interface PostFormModel {
  title: string;
  content: string;
  tags: string;
}

@Component({
  selector: 'rh-new-post',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto space-y-6 md:space-y-8 pb-8 px-4 md:px-0">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
          {{ (editing() ? 'newPost.editTitle' : 'newPost.title') | translate }}
        </h1>
        <p class="text-xs md:text-sm text-gray-500 mt-2">
          {{ (editing() ? 'newPost.editSubtitle' : 'newPost.subtitle') | translate }}
        </p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      } @else {
        <form class="space-y-6" (submit)="onSubmit($event)" novalidate>
          <div class="space-y-2">
            <label for="post-title" class="block text-xs font-medium text-gray-700 uppercase">
              {{ 'newPost.titleLabel' | translate }}
            </label>
            <input
              id="post-title"
              type="text"
              [formField]="postForm.title"
              [placeholder]="'newPost.titlePlaceholder' | translate"
              class="w-full px-4 py-2.5 bg-gray-100 rounded-sm text-sm focus:outline-none transition-shadow"
              [class.ring-2]="titleInvalid()"
              [class.ring-red-500]="titleInvalid()"
              [class.focus:ring-primary-light]="!titleInvalid()"
            />
            @if (titleInvalid()) {
              <p class="text-xs text-red-600">
                {{ 'validation.required' | translate }}
              </p>
            }
          </div>

          <div class="space-y-2">
            <label for="post-content" class="block text-xs font-medium text-gray-700 uppercase">
              {{ 'newPost.contentLabel' | translate }}
            </label>
            <textarea
              id="post-content"
              rows="10"
              [formField]="postForm.content"
              [placeholder]="'newPost.contentPlaceholder' | translate"
              class="w-full px-4 py-3 bg-gray-100 rounded-sm text-sm resize-none focus:outline-none transition-shadow"
              [class.ring-2]="contentInvalid()"
              [class.ring-red-500]="contentInvalid()"
              [class.focus:ring-primary-light]="!contentInvalid()"
            >
            </textarea>
            @if (contentInvalid()) {
              <p class="text-xs text-red-600">
                {{ 'validation.required' | translate }}
              </p>
            }
          </div>

          <div class="space-y-2">
            <label for="post-tags" class="block text-xs font-medium text-gray-700 uppercase">
              {{ 'newPost.tagsLabel' | translate }}
            </label>
            <input
              id="post-tags"
              type="text"
              [formField]="postForm.tags"
              [placeholder]="'newPost.tagsPlaceholder' | translate"
              class="w-full px-4 py-2.5 bg-gray-100 rounded-sm text-sm focus:outline-none transition-shadow"
            />
            <p class="text-xs text-gray-500">
              {{ 'newPost.tagsHint' | translate }}
            </p>
          </div>

          <div class="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            <rh-button type="button" variant="secondary" [fullWidth]="true" (clicked)="onCancel()">
              {{ 'newPost.cancel' | translate }}
            </rh-button>
            <rh-button
              type="button"
              variant="primary"
              [fullWidth]="true"
              [disabled]="submitting()"
              (clicked)="onSubmit($event)"
            >
              {{
                (submitting() ? 'common.loading' : editing() ? 'newPost.save' : 'newPost.publish')
                  | translate
              }}
            </rh-button>
          </div>
        </form>
      }
    </div>
  `,
  imports: [TranslateModule, ButtonComponent, FormField],
})
export class NewPostComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);

  public submitting = signal(false);
  public loading = signal(false);
  public editingId = signal<string | null>(null);
  public editing = computed(() => this.editingId() !== null);

  private model = signal<PostFormModel>({ title: '', content: '', tags: '' });
  public postForm = form(this.model, (path) => {
    required(path.title);
    required(path.content);
  });

  public titleInvalid = computed(
    () => this.postForm.title().touched() && !this.postForm.title().valid(),
  );
  public contentInvalid = computed(
    () => this.postForm.content().touched() && !this.postForm.content().valid(),
  );

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editingId.set(id);
    this.loading.set(true);
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        const user = this.authService.currentUser();
        if (!user || post.userId !== user.id) {
          this.router.navigateByUrl(this.languageService.localize('/forbidden'));
          return;
        }
        const tagNames = (post.postTags ?? [])
          .map((postTag) => postTag.tag?.name)
          .filter((name): name is string => !!name);
        this.model.set({
          title: post.title,
          content: post.content,
          tags: tagNames.join(', '),
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error(this.translateService.instant('common.error'));
        this.router.navigateByUrl(this.languageService.localize('/'));
      },
    });
  }

  public onSubmit(event?: Event): void {
    event?.preventDefault();
    if (this.submitting()) return;

    if (!this.postForm().valid()) {
      this.postForm.title().markAsDirty();
      this.postForm.title().markAsTouched();
      this.postForm.content().markAsDirty();
      this.postForm.content().markAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigateByUrl(this.languageService.localize('/login'));
      return;
    }

    const value = this.model();
    const editingId = this.editingId();
    const tagNames = value.tags
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    this.submitting.set(true);

    this.postService
      .findOrCreateTags(tagNames)
      .pipe(
        switchMap((tagIds) =>
          editingId
            ? this.postService.updatePost(editingId, {
                title: value.title.trim(),
                content: value.content.trim(),
                tagIds,
              })
            : this.postService.createPost({
                userId: user.id,
                title: value.title.trim(),
                content: value.content.trim(),
                tagIds,
              }),
        ),
      )
      .subscribe({
        next: (post) => {
          this.submitting.set(false);
          toast.success(
            this.translateService.instant(editingId ? 'newPost.updated' : 'newPost.created'),
          );
          this.router.navigateByUrl(this.languageService.localize(`/posts/${post.id}`));
        },
        error: () => {
          this.submitting.set(false);
          toast.error(this.translateService.instant('common.error'));
        },
      });
  }

  public onCancel(): void {
    const id = this.editingId();
    const target = id ? `/posts/${id}` : '/';
    this.router.navigateByUrl(this.languageService.localize(target));
  }
}
