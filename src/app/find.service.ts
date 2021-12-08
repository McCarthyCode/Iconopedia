import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { CategoriesService } from './categories.service';
import { IconsService } from './icons.service';
import { Category } from './models/category.model';
import { Icon } from './models/icon.model';

const emptyCategories: Category.IClientDataList = {
  results: [],
  retrieved: new Date(),
};
const emptyIcons: Icon.IClientDataList = {
  results: [],
  pagination: {
    totalResults: 0,
    maxResultsPerPage: 100,
    numResultsThisPage: 0,
    thisPageNumber: 0,
    totalPages: 0,
    prevPageExists: false,
    nextPageExists: false,
  },
  retrieved: new Date(),
};

@Injectable({
  providedIn: 'root',
})
export class FindService {
  // Behavior Subjects
  category$ = new BehaviorSubject<Category.IClientData>(null);
  categories$ = new BehaviorSubject<Category.IClientDataList>(emptyCategories);
  icons$ = new BehaviorSubject<Icon.IClientDataList>(emptyIcons);

  // Replay Subjects
  reset$ = new ReplaySubject<void>();

  // Subscriptions
  iconsSub: Subscription;
  categoriesSub: Subscription;
  iconClickSub: Subscription;

  // Booleans
  loadingCategories = true;
  loadingIcons = true;
  libraryVisible = false;

  // Attributes
  query = '';
  categoryId: number;
  page = 1;

  allIcons = true;
  breadcrumbs = 'All Icons';

  // Route Booleans
  get browseVisible(): boolean {
    return this._router.url === '/icons/browse';
  }

  get searchResultsVisible(): boolean {
    return this._router.url === '/icons/search-results';
  }

  // Message Flags
  get emptyQuery(): boolean {
    return this.query.length === 0
      ? this.allIcons || this.categoryId === undefined
      : false;
  }

  get notFound(): boolean {
    return (
      (this.allIcons || this.categoryId === undefined) && this.query.length > 0
    );
  }

  get broadenSearch(): boolean {
    return this.categoryId !== undefined && this.query.length > 0;
  }

  constructor(
    private _iconsSrv: IconsService,
    private _categoriesSrv: CategoriesService,
    private _router: Router
  ) {}

  resetCategories(): void {
    this.loadingCategories = true;
  }

  resetIcons(empty = true): void {
    this.loadingIcons = true;

    if (empty) {
      this.page = 1;
      this.icons$.next(emptyIcons);
    } else {
      this.page++;
    }
  }

  onAllIconsChange(checked: boolean): void {
    this.resetCategories();
    this.resetIcons();

    this.allIcons = checked;
    if (!(checked || this.categoryId)) {
      setTimeout(() => {
        this.allIcons = true;
      }, 100);
    }

    if (this.emptyQuery) return;

    if (this.categoriesSub) this.categoriesSub.unsubscribe();
    this.categoriesSub = this.category$.subscribe((category) => {
      // this.loadingCategories = false;

      if (this.iconsSub) this.iconsSub.unsubscribe();
      this.iconsSub = this._iconsSrv
        .list(
          this.query ? this.query : undefined,
          this.allIcons ? undefined : this.categoryId,
          this.page
        )
        .subscribe((icons) => {
          this.icons$.next(icons);
          this.loadingIcons = false;
        });
    });
  }

  onSearchbar(query: string): void {
    this.resetCategories();
    this.resetIcons();

    this.query = query;

    if (this.emptyQuery) return;

    if (this.categoriesSub) this.categoriesSub.unsubscribe();
    this.categoriesSub = this.category$.subscribe((category) => {
      // this.loadingCategories = false;

      if (this.iconsSub) this.iconsSub.unsubscribe();
      this.iconsSub = this._iconsSrv
        .list(
          this.query ? this.query : undefined,
          this.allIcons ? undefined : this.categoryId,
          this.page
        )
        .subscribe((icons) => {
          this.icons$.next(icons);
          this.loadingIcons = false;
        });
    });
  }

  onClickCategory(allIcons: boolean = false): void {
    this.resetCategories();
    this.resetIcons();

    this.allIcons = allIcons;
    if (!this.query) this.breadcrumbs = '';
    if (this.emptyQuery) return;

    this._categoriesSrv.retrieve(this.categoryId).subscribe((category) => {
      this.breadcrumbs = [category.path, category.name]
        .filter(Boolean)
        .join(' » ');
      this.category$.next(category);

      const categories: Category.IClientDataList = {
        retrieved: category.retrieved,
        results: category.children,
      };
      this.categories$.next(categories);
      this.loadingCategories = false;

      if (this.iconsSub) this.iconsSub.unsubscribe();
      this.iconsSub = this._iconsSrv
        .list(
          this.query ? this.query : undefined,
          this.allIcons ? undefined : this.categoryId,
          this.page
        )
        .subscribe((icons) => {
          this.icons$.next(icons);
          this.loadingIcons = false;
        });
    });
  }

  onReset(): void {
    this.reset$.next();
    this.categoryId = undefined;
    this.breadcrumbs = '';
    this.allIcons = true;
  }
}
