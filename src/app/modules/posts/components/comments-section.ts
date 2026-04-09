import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, Pencil, Trash2, X, Check } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { form, FormField, required } from '@angular/forms/signals';

import { CommentComponent } from './comment';
import { ButtonComponent } from '../../../shared/components/button';
import { AuthService } from '../../auth/service/auth.service';
import { PostService } from '../services/post.service';
import { environment } from '../../../../environments/environment';
import { canUserManage } from '../../../core/auth/ownership';

interface CommentEntity {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt?: string;
  user?: { id: number; name: string; email: string };
}

interface CommentModel {
  content: string;
}

@Component({
  selector: 'rh-comments-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-4 md:space-y-6">
      <h3 class="text-xl md:text-2xl font-bold text-gray-900">
        {{ 'postDetail.comments' | translate }} ({{ comments().length }})
      </h3>

      @if (loading() && comments().length === 0) {
        <div class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      } @else if (commentsResource.error()) {
        <p
          class="text-xs md:text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2"
        >
          {{ 'common.error' | translate }}
        </p>
      } @else {
        <div class="space-y-4 md:space-y-6">
          @for (comment of comments(); track comment.id) {
            <div class="border-b border-gray-200 pb-4 md:pb-6 last:border-b-0">
              @if (editingId() === comment.id) {
                <div class="space-y-3">
                  <textarea
                    rows="4"
                    [formField]="editForm.content"
                    class="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 rounded-sm text-xs md:text-sm resize-none focus:outline-none"
                  >
                  </textarea>
                  <div class="flex flex-col-reverse sm:flex-row justify-end gap-2">
                    <rh-button
                      type="button"
                      variant="secondary"
                      [icon]="cancelIcon"
                      [fullWidth]="true"
                      (clicked)="onCancelEdit()"
                    >
                      {{ 'postDetail.cancelEdit' | translate }}
                    </rh-button>
                    <rh-button
                      type="button"
                      variant="primary"
                      [icon]="saveIcon"
                      [fullWidth]="true"
                      [disabled]="savingEdit()"
                      (clicked)="onSaveEdit(comment)"
                    >
                      {{ 'postDetail.saveEdit' | translate }}
                    </rh-button>
                  </div>
                </div>
              } @else {
                <div class="flex items-start justify-between gap-3 md:gap-4">
                  <div class="flex-1 min-w-0">
                    <rh-comment
                      [author]="comment.user?.name || 'Unknown'"
                      [createdAt]="comment.createdAt || ''"
                      [content]="comment.content"
                    />
                  </div>
                  @if (canManage(comment)) {
                    <div class="flex gap-1 shrink-0">
                      <button
                        type="button"
                        (click)="onStartEdit(comment)"
                        class="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                        [title]="'postDetail.editComment' | translate"
                      >
                        <lucide-icon [img]="editIcon" [size]="14"></lucide-icon>
                      </button>
                      <button
                        type="button"
                        (click)="onDelete(comment)"
                        [disabled]="deletingId() === comment.id"
                        class="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        [title]="'postDetail.deleteComment' | translate"
                      >
                        <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          } @empty {
            <p class="text-sm md:text-base text-gray-500 text-center py-8">
              {{ 'postDetail.noComments' | translate }}
            </p>
          }
        </div>

        @if (isAuthenticated()) {
          <div class="space-y-3 md:space-y-4 pt-2">
            <h4 class="text-base md:text-lg font-semibold text-gray-900">
              {{ 'postDetail.addComment' | translate }}
            </h4>
            <textarea
              rows="4"
              [formField]="newForm.content"
              [placeholder]="'postDetail.commentPlaceholder' | translate"
              class="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 rounded-sm text-xs md:text-sm resize-none focus:outline-none transition-shadow"
              [class.ring-2]="newContentInvalid()"
              [class.ring-red-500]="newContentInvalid()"
              [class.focus:ring-primary-light]="!newContentInvalid()"
            >
            </textarea>
            @if (newContentInvalid()) {
              <p class="text-xs text-red-600">
                {{ 'validation.required' | translate }}
              </p>
            }
            <div class="flex justify-end">
              <rh-button
                type="button"
                variant="primary"
                [fullWidth]="true"
                [disabled]="publishing()"
                (clicked)="onPublish()"
              >
                {{ 'postDetail.publishComment' | translate }}
              </rh-button>
            </div>
          </div>
        }
      }
    </section>
  `,
  imports: [CommentComponent, ButtonComponent, TranslateModule, LucideAngularModule, FormField],
})
export class CommentsSectionComponent {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private translateService = inject(TranslateService);

  public postId = input.required<number>();

  public readonly editIcon = Pencil;
  public readonly trashIcon = Trash2;
  public readonly cancelIcon = X;
  public readonly saveIcon = Check;

  public commentsResource = httpResource<CommentEntity[]>(
    () => `${environment.apiUrl}/comments?postId=${this.postId()}&_expand=user&_sort=id&_order=asc`,
    { defaultValue: [] },
  );

  public comments = signal<CommentEntity[]>([]);

  public loading = computed(() => this.commentsResource.isLoading());

  public publishing = signal(false);
  public deletingId = signal<number | null>(null);
  public editingId = signal<number | null>(null);
  public savingEdit = signal(false);

  private newModel = signal<CommentModel>({ content: '' });
  public newForm = form(this.newModel, (path) => required(path.content));
  public newContentInvalid = computed(
    () => this.newForm.content().touched() && !this.newForm.content().valid(),
  );

  private editModel = signal<CommentModel>({ content: '' });
  public editForm = form(this.editModel, (path) => required(path.content));

  public isAuthenticated = computed(() => this.authService.isAuthenticated());

  public constructor() {
    effect(() => {
      const value = this.commentsResource.value();
      if (value) this.comments.set(value);
    });
  }

  public canManage(comment: { userId: number }): boolean {
    return canUserManage(comment, this.authService.currentUser());
  }

  public onStartEdit(comment: CommentEntity): void {
    this.editingId.set(comment.id);
    this.editModel.set({ content: comment.content });
  }

  public onCancelEdit(): void {
    this.editingId.set(null);
    this.editModel.set({ content: '' });
    this.editForm.content().reset();
  }

  public onSaveEdit(original: CommentEntity): void {
    if (this.savingEdit() || !this.editForm().valid()) {
      this.editForm.content().markAsDirty();
      this.editForm.content().markAsTouched();
      return;
    }

    const newContent = this.editModel().content.trim();
    this.savingEdit.set(true);
    this.postService.updateComment(original.id, { content: newContent }).subscribe({
      next: () => {
        this.comments.update((list) =>
          list.map((comment) =>
            comment.id === original.id ? { ...comment, content: newContent } : comment,
          ),
        );
        this.savingEdit.set(false);
        this.onCancelEdit();
        toast.success(this.translateService.instant('postDetail.commentUpdated'));
      },
      error: () => {
        this.savingEdit.set(false);
        toast.error(this.translateService.instant('common.error'));
      },
    });
  }

  public onDelete(comment: CommentEntity): void {
    if (
      this.deletingId() ||
      !window.confirm(this.translateService.instant('postDetail.confirmDeleteComment'))
    )
      return;

    this.deletingId.set(comment.id);

    this.postService.deleteComment(comment.id).subscribe({
      next: () => {
        this.comments.update((list) => list.filter((existing) => existing.id !== comment.id));
        this.deletingId.set(null);
        toast.success(this.translateService.instant('postDetail.commentDeleted'));
      },
      error: () => {
        this.deletingId.set(null);
        toast.error(this.translateService.instant('common.error'));
      },
    });
  }

  public onPublish(): void {
    if (this.publishing() || !this.newForm().valid()) {
      this.newForm.content().markAsDirty();
      this.newForm.content().markAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user) return;

    this.publishing.set(true);
    this.postService
      .createComment({
        postId: this.postId(),
        userId: user.id,
        content: this.newModel().content.trim(),
      })
      .subscribe({
        next: (created) => {
          this.comments.update((list) => [...list, { ...created, user }]);
          this.newModel.set({ content: '' });
          this.newForm.content().reset();
          this.publishing.set(false);
          toast.success(this.translateService.instant('postDetail.commentPublished'));
        },
        error: () => {
          this.publishing.set(false);
          toast.error(this.translateService.instant('common.error'));
        },
      });
  }
}
