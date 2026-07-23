export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
};

export type Task = {
  content: string;
  id: Id;
  columnId: Id;
};