import { Model } from './model';

export namespace Post {
  export interface IModel extends Model.IModel {
    title: string;
    content: string;
    created: Date;
    updated: Date;
  }

  export interface IResponseBody extends Model.IResponseBody<IModel> {}
  export interface IResponseBodyList extends Model.IResponseBodyList<IModel> {}
  export interface IClientData extends Model.IClientData<IModel> {}
  export interface IClientDataList extends Model.IClientDataList<IModel> {}

  export namespace Comment {
    export interface IModel extends Model.IModel {
      post: number;
      content: string;
      parent?: number;
    }

    export interface IResponseBody extends Model.IResponseBody<IModel> {}
    export interface IResponseBodyList
      extends Model.IResponseBodyList<IModel> {}
    export interface IClientData extends Model.IClientData<IModel> {}
    export interface IClientDataList extends Model.IClientDataList<IModel> {}
  }
}