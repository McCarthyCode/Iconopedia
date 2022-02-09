import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { IPagination } from './interfaces/pagination.interface';
import { Model } from './models/model';

export abstract class GenericService<
  IModel extends Model.IModel,
  IRequestBody extends Model.IRequestBody,
  IResponseBody extends Model.IResponseBody<IModel>,
  IResponseBodyList extends Model.IResponseBodyList<IModel>,
  IClientData extends Model.IClientData<IModel>,
  IClientDataList extends Model.IClientDataList<IModel>
> {
  constructor(
    private _path: string,
    private _http: HttpClient,
    private _authSrv: AuthService,
    private _router: Router,
    private _modalCtrl: ModalController
  ) {}

  private pagination$ = new BehaviorSubject<IPagination>(null);
  get pagination(): IPagination {
    return this.pagination$.value;
  }
  set pagination(value: IPagination) {
    this.pagination$.next(value);
  }

  convert(result: IResponseBody): IClientData {
    return {
      success: result.success,
      errors: result.errors,
      data: result.data,
      retrieved: new Date(),
    } as unknown as IClientData;
  }

  convertList(results: IResponseBodyList): IClientDataList {
    return {
      success: results.success,
      errors: results.errors,
      data: results.data,
      retrieved: new Date(),
    } as unknown as IClientDataList;
  }

  retrieve(id: number): Observable<IClientData> {
    return this._http
      .get<IResponseBody>([environment.apiBase, this._path, id].join('/'))
      .pipe(debounceTime(250), map(this.convert));
  }

  list(params: any = {}): Observable<IClientDataList> {
    return this._http
      .get<IResponseBodyList>([environment.apiBase, this._path].join('/'), {
        params: params,
      })
      .pipe(debounceTime(250), map(this.convertList));
  }

  create(
    formData: FormData,
    auth = true
  ): Observable<IClientData | HttpErrorResponse> {
    if (auth) {
      return this._authSrv.authHeader$.pipe(
        switchMap((headers: HttpHeaders) => {
          if (headers === null) {
            this._modalCtrl.dismiss();
            return of(null);
          }

          return this._create(formData, headers);
        })
      );
    }

    return this._create(formData);
  }

  private _create(
    formData: FormData,
    headers: HttpHeaders = undefined
  ): Observable<IClientData | HttpErrorResponse> {
    return this._http
      .post<IResponseBody>(
        [environment.apiBase, this._path].join('/'),
        formData,
        {
          headers: headers,
        }
      )
      .pipe(debounceTime(250), map(this.convert));
  }

  update(
    formData: FormData,
    auth = true
  ): Observable<IClientData | HttpErrorResponse> {
    if (auth) {
      return this._authSrv.authHeader$.pipe(
        switchMap((headers: HttpHeaders) => {
          if (headers === null) {
            return of(null);
          }

          return this._update(formData, headers);
        })
      );
    }

    return this._update(formData);
  }

  private _update(
    formData: FormData,
    headers: HttpHeaders = undefined
  ): Observable<IClientData | HttpErrorResponse> {
    return this._http
      .put<IResponseBody>(
        [environment.apiBase, this._path, formData['id']].join('/'),
        formData,
        { headers: headers }
      )
      .pipe(debounceTime(250), map(this.convert));
  }

  partialUpdate(
    formData: FormData,
    auth = true
  ): Observable<IClientData | HttpErrorResponse> {
    if (auth) {
      return this._authSrv.authHeader$.pipe(
        switchMap((headers: HttpHeaders) => {
          if (headers === null) {
            return of(null);
          }

          return this._partialUpdate(formData, headers);
        })
      );
    }

    return this._partialUpdate(formData);
  }

  private _partialUpdate(
    formData: FormData,
    headers: HttpHeaders = undefined
  ): Observable<IClientData | HttpErrorResponse> {
    return this._http
      .patch<IResponseBody>(
        [environment.apiBase, this._path, formData['id']].join('/'),
        formData,
        { headers: headers }
      )
      .pipe(debounceTime(250), map(this.convert));
  }

  delete(id: number, auth = true): Observable<HttpResponse<null>> {
    if (auth) {
      return this._authSrv.authHeader$.pipe(
        switchMap((headers: HttpHeaders) => {
          if (headers === null) {
            return of(null);
          }

          return this._delete(id, headers);
        })
      );
    }

    return this._delete(id);
  }

  private _delete(id: number, headers: HttpHeaders = undefined) {
    return this._http
      .delete<null>([environment.apiBase, this._path, id].join('/'), {
        headers: headers,
      })
      .pipe(debounceTime(250));
  }
}
