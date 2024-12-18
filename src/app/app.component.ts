import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListManager } from './list-manager/list-manager';

type User = {
  readonly createdAt: string;
  readonly name: string;
  readonly avatar: string;
  readonly id: number;
};

type filter = {
  readonly search: string;
};

type Sort = {
  readonly direction: 'asc' | 'des';
  readonly field: keyof User;
};

const DEFAULT_SORT: Sort = {
  direction: 'asc',
  field: 'name',
};

const DEFAULT_FILTER: filter = {
  search: '',
};

@Component({
  selector: 'app-root',
  imports: [JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly httpClient = inject(HttpClient);

  protected readonly listManager = new ListManager<User[], Sort, filter>({
    initFilter: DEFAULT_FILTER,
    initSort: DEFAULT_SORT,
    fetch: ({ sort, filter, pagination }) => {
      console.log(sort, filter, pagination);
      return this.httpClient.get<User[]>(
        'https://6641a41b3d66a67b3434756c.mockapi.io/api/v1/users'
      );
    },
  });

  protected onSearchChange(event: Event): void {
    this.listManager.setFilter({
      ...this.listManager.queryParams().filter,
      search: (event.target as HTMLInputElement).value,
    });
  }
}
