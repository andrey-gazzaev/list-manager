import {
  Signal,
  WritableSignal,
  computed,
  effect,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

type FetchFn<TList, TSort = void, TFilter = void> = (
  queryParams: QueryParams<TSort, TFilter>
) => Observable<TList | null>;

type Pagination = {
  readonly pageNumber: number;
  readonly pageSize: number;
};

type QueryParams<TSort = void, TFilter = void> = {
  filter: TFilter | null;
  sort: TSort | null;
  pagination: Pagination;
};

type ListManagerInit<TList, TSort = void, TFilter = void> = {
  readonly initFilter?: TFilter;
  readonly initSort?: TSort;
  readonly initPagination?: Pagination;
  readonly fetch: FetchFn<TList, TSort, TFilter>;
  readonly activatedRoute: ActivatedRoute;
  readonly router: Router;
};

const DEFAULT_PAGINATION: Pagination = {
  pageNumber: 1,
  pageSize: 10,
};

export class ListManager<TList, TSort = void, TFilter = void> {
  private readonly filter: WritableSignal<TFilter | null>;

  private readonly sort: WritableSignal<TSort | null>;

  private readonly pagination: WritableSignal<Pagination>;

  public readonly queryParams: Signal<QueryParams<TSort, TFilter>>;

  private readonly fetch: FetchFn<TList, TSort, TFilter>;

  public readonly list$: Observable<TList | null>;

  public constructor(data: ListManagerInit<TList, TSort, TFilter>) {
    this.filter = signal<TFilter | null>(data.initFilter ?? null);
    this.sort = signal<TSort | null>(data.initSort ?? null);
    this.pagination = signal<Pagination>(
      data.initPagination ?? DEFAULT_PAGINATION
    );
    this.fetch = data.fetch;
    this.queryParams = computed(() => ({
      filter: this.filter(),
      sort: this.sort(),
      pagination: this.pagination(),
    }));

    effect(() => {
      const params = new URLSearchParams(document.location.href);
      const queryParams = this.queryParams();
      for (const item in queryParams) {
        const value = queryParams[item as keyof typeof queryParams];
        if (value != null) {
          this.appendParamsToUrlSearchParams(params, value);
        }
      }

      data.router.navigate([], {
        relativeTo: data.activatedRoute,
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    });

    this.list$ = toObservable(this.queryParams).pipe(
      switchMap((queryParams) => this.fetch(queryParams))
    );
  }

  private appendParamsToUrlSearchParams(
    params: URLSearchParams,
    value: { [key: string]: any }
  ) {
    for (const item in value) {
      params.append(String(item), String(value[item]));
    }
  }

  public setFilter(filter: TFilter): void {
    this.filter.set(filter);
  }

  public setSort(sort: TSort): void {
    this.sort.set(sort);
  }

  public setPagination(pagination: Pagination): void {
    this.pagination.set(pagination);
  }
}
