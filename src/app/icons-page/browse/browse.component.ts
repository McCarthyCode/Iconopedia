import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CategoriesService } from 'src/app/categories.service';
import { FindService } from 'src/app/find.service';
import { Category } from 'src/app/models/category.model';

type CategoryNode = Category.ITreeNode;

@Component({
  selector: 'app-category-node',
  templateUrl: './category-node.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class CategoryNodeComponent implements OnInit {
  @Input() category: CategoryNode;
  @Input() expand = false;

  private _active = false;
  get active(): boolean {
    return this.category.id === this._findSrv.category ? this._active : false;
  }

  constructor(
    private _categoriesSrv: CategoriesService,
    private _findSrv: FindService
  ) {}

  ngOnInit(): void {
    this._categoriesSrv.list(this.category.id).subscribe((categories) => {
      this.category.children = categories.results.map((category) => {
        return { id: category.id, name: category.name, children: [] };
      });
    });
  }

  onClick($event): void {
    $event.stopPropagation();

    if (this._active) {
      this.expand = false;

      this._active = false;
      this._findSrv.category = undefined;
    } else if (this.expand) {
      this._active = true;
      this._findSrv.category = this.category.id;
    } else if (this.category.children.length > 0) {
      this.expand = true;
    } else {
      this._active = true;
      this._findSrv.category = this.category.id;
    }
  }
}

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements OnInit {
  categoriesTree: CategoryNode;
  categoriesList: Category.ICategory[];

  constructor(private _categoriesSrv: CategoriesService) {}

  ngOnInit() {
    this.initializeTree();
  }

  ionViewWillEnter(): void {}

  initializeTree(): void {
    this.categoriesTree = { id: 0, name: 'All Icons', children: [] };
    this._categoriesSrv.list().subscribe((categories) => {
      this.categoriesList = categories.results;

      let children = this.categoriesList.filter(
        (category) => category.parent === null
      );

      for (let child of children) {
        this.categoriesTree.children.push(child as CategoryNode);
      }
    });
  }
}
