"use client";

import * as React from "react";
import {
  sortFn_datetime,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  tableFeatures,
  useTable,
  createSortedRowModel,
  rowSortingFeature,
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  type ColumnVisibilityState,
} from "@tanstack/react-table";

const TABLE_FEATURES = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    datetime: sortFn_datetime,
  },
});
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconPlaceholder } from "@/components/ui/team-members-data-table-utils/icon-placeholder";

type Status = "Active" | "Invited" | "Inactive";
type Role = "Admin" | "Editor" | "Viewer";

type Member = {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  email: string;
  status: Status;
  role: Role;
  joined: string;
};

const statusVariant: Record<Status, "default" | "secondary" | "outline"> = {
  Active: "default",
  Invited: "secondary",
  Inactive: "outline",
};

const roleClass: Record<Role, string> = {
  Admin: "text-foreground font-medium",
  Editor: "text-muted-foreground",
  Viewer: "text-muted-foreground",
};

const COLUMN_LABELS: Record<string, string> = {
  name: "Member",
  status: "Status",
  role: "Role",
  joined: "Joined",
};

const members: Member[] = [
  {
    id: "m-01",
    name: "Ada Lovelace",
    initials: "AL",
    avatar: "https://cdn.21st.dev/assets/mirror/93/93a1ee3f10b9da51ac1432f03a0680fa3016b4a2eb6659aef46c25df091ab930.jpg",
    email: "ada@acme.io",
    status: "Active",
    role: "Admin",
    joined: "2026-06-12",
  },
  {
    id: "m-02",
    name: "Alan Turing",
    initials: "AT",
    avatar: "https://cdn.21st.dev/assets/mirror/ac/ac9c53a00de9dbc0d8733c544cb6f33f58bfe72943ec1c90f235716887ade7fa.jpg",
    email: "alan@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-06-10",
  },
  {
    id: "m-03",
    name: "Grace Hopper",
    initials: "GH",
    avatar: "https://cdn.21st.dev/assets/mirror/c0/c0343948e45281027b004b3ffe9dcff420da60fd519ffc5fb07aa3234748c0af.jpg",
    email: "grace@acme.io",
    status: "Invited",
    role: "Editor",
    joined: "2026-06-08",
  },
  {
    id: "m-04",
    name: "Linus Pauling",
    initials: "LP",
    avatar: "https://cdn.21st.dev/assets/mirror/51/511e8a28ad384d1692e249771c5da88414ce778aec74ea21451d519db92e0038.jpg",
    email: "linus@acme.io",
    status: "Inactive",
    role: "Viewer",
    joined: "2026-05-29",
  },
  {
    id: "m-05",
    name: "Katherine Johnson",
    initials: "KJ",
    avatar: "https://cdn.21st.dev/assets/mirror/d6/d68cea441c84f2e369c336b236cbca4fca0831a16f3d63a1f701d23ebf5c42b5.jpg",
    email: "katherine@acme.io",
    status: "Active",
    role: "Viewer",
    joined: "2026-05-21",
  },
  {
    id: "m-06",
    name: "Edsger Dijkstra",
    initials: "ED",
    avatar: "https://cdn.21st.dev/assets/mirror/1e/1eae7b973d325c8ed9241a4b11415e1f2b1b1ab8a21b7ae27889dc55766505d9.jpg",
    email: "edsger@acme.io",
    status: "Active",
    role: "Admin",
    joined: "2026-05-18",
  },
  {
    id: "m-07",
    name: "Barbara Liskov",
    initials: "BL",
    avatar: "https://cdn.21st.dev/assets/mirror/b7/b75d060316c98cfd2dec3eab22d1eb010a9d8df4b26d5957d03eff7eb10ded12.jpg",
    email: "barbara@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-05-14",
  },
  {
    id: "m-08",
    name: "Tim Berners-Lee",
    initials: "TB",
    avatar: "https://cdn.21st.dev/assets/mirror/da/daace32991f4216fa2ec402ffa1f71ee330c87c398063dd890bc3ca8a774c5e9.jpg",
    email: "tim@acme.io",
    status: "Invited",
    role: "Viewer",
    joined: "2026-05-09",
  },
  {
    id: "m-09",
    name: "Margaret Hamilton",
    initials: "MH",
    avatar: "https://cdn.21st.dev/assets/mirror/a4/a4f796780e78d2c6c13f57c2f81a3fa8c26c8fcdbfdbfe2c32cdbe4dc3d940e2.jpg",
    email: "margaret@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-05-04",
  },
  {
    id: "m-10",
    name: "Donald Knuth",
    initials: "DK",
    avatar: "https://cdn.21st.dev/assets/mirror/0f/0f13af308f416a759fba7631d1b0f5250d783edd99e9aa0e3e9374841e5206d8.jpg",
    email: "donald@acme.io",
    status: "Inactive",
    role: "Viewer",
    joined: "2026-04-28",
  },
  {
    id: "m-11",
    name: "Radia Perlman",
    initials: "RP",
    avatar: "https://cdn.21st.dev/assets/mirror/c2/c213f4267d32d83f614be63b0f52ff9c1101286aa4b00994f4de5eb603921e06.jpg",
    email: "radia@acme.io",
    status: "Active",
    role: "Admin",
    joined: "2026-04-22",
  },
  {
    id: "m-12",
    name: "Ken Thompson",
    initials: "KT",
    avatar: "https://cdn.21st.dev/assets/mirror/53/5318bbb9114e8063402900ae1541911133b3a8b8d53275fafc7d06309581c481.jpg",
    email: "ken@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-04-19",
  },
  {
    id: "m-13",
    name: "Hedy Lamarr",
    initials: "HL",
    avatar: "https://cdn.21st.dev/assets/mirror/d2/d2a72ff485aba7fb6dc84aeafdb7f31f1e24e7f318dda6dee6ca8f78b49c6d0d.jpg",
    email: "hedy@acme.io",
    status: "Invited",
    role: "Viewer",
    joined: "2026-04-15",
  },
  {
    id: "m-14",
    name: "Dennis Ritchie",
    initials: "DR",
    avatar: "https://cdn.21st.dev/assets/mirror/53/5376894dc3e779a0f96d0af6e42cda3df611f2c68d162c84da91576ef8145c4e.jpg",
    email: "dennis@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-04-11",
  },
  {
    id: "m-15",
    name: "Shafi Goldwasser",
    initials: "SG",
    avatar: "https://cdn.21st.dev/assets/mirror/35/355f20d78dc8c5d7a0395a161d35d5ed6ab373209e8d4d0d16af76f92a06a394.jpg",
    email: "shafi@acme.io",
    status: "Active",
    role: "Viewer",
    joined: "2026-04-07",
  },
  {
    id: "m-16",
    name: "John McCarthy",
    initials: "JM",
    avatar: "https://cdn.21st.dev/assets/mirror/01/01c1b7f99fc6d0c7a21420abce6c1173dae5a66b0ef89e55a4d4484568242f88.jpg",
    email: "john@acme.io",
    status: "Inactive",
    role: "Viewer",
    joined: "2026-04-02",
  },
  {
    id: "m-17",
    name: "Frances Allen",
    initials: "FA",
    avatar: "https://cdn.21st.dev/assets/mirror/ab/abd98c27afa1e8c863b0299cdf8cfda26870eda1e1e051f8f8869068aed80e36.jpg",
    email: "frances@acme.io",
    status: "Active",
    role: "Admin",
    joined: "2026-03-29",
  },
  {
    id: "m-18",
    name: "Vint Cerf",
    initials: "VC",
    avatar: "https://cdn.21st.dev/assets/mirror/e2/e29351a2921455715aa7e1b1d403ce19d64d84a332ac06ac00c9168cfd1a016e.jpg",
    email: "vint@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-03-24",
  },
  {
    id: "m-19",
    name: "Adele Goldberg",
    initials: "AG",
    avatar: "https://cdn.21st.dev/assets/mirror/3a/3ac95068dba7bf9f6187aa9209b6a8de039c56f56155f380fe081798e6c7d5c0.jpg",
    email: "adele@acme.io",
    status: "Invited",
    role: "Viewer",
    joined: "2026-03-20",
  },
  {
    id: "m-20",
    name: "Bjarne Stroustrup",
    initials: "BS",
    avatar: "https://cdn.21st.dev/assets/mirror/31/3118a54b2d19d72a16199951606fd3adc8476ea37bb80249afbeec493edf5263.jpg",
    email: "bjarne@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-03-16",
  },
  {
    id: "m-21",
    name: "Karen Spärck Jones",
    initials: "KS",
    avatar: "https://cdn.21st.dev/assets/mirror/63/63ae7d0a787e12204e22cfbb11db78d0ce4fdd5a9e5d1bb2a5219f705201d1a3.jpg",
    email: "karen@acme.io",
    status: "Active",
    role: "Viewer",
    joined: "2026-03-11",
  },
  {
    id: "m-22",
    name: "Brian Kernighan",
    initials: "BK",
    avatar: "https://cdn.21st.dev/assets/mirror/28/288823a84894781242bf1082936537b8efe5a1fdd4794edffb030444d8a314c9.jpg",
    email: "brian@acme.io",
    status: "Inactive",
    role: "Viewer",
    joined: "2026-03-06",
  },
  {
    id: "m-23",
    name: "Sophie Wilson",
    initials: "SW",
    avatar: "https://cdn.21st.dev/assets/mirror/e8/e89fa219f68ef3e7591e332db4be4e6ffbb4ddbb27bd313deddbee8dff83ef9c.jpg",
    email: "sophie@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-03-01",
  },
  {
    id: "m-24",
    name: "Guido van Rossum",
    initials: "GR",
    avatar: "https://cdn.21st.dev/assets/mirror/e8/e88ae65f006521632d5b38a93cc61f219a9c12dc216f4ef4504f5c8f77419bc4.jpg",
    email: "guido@acme.io",
    status: "Active",
    role: "Admin",
    joined: "2026-02-24",
  },
  {
    id: "m-25",
    name: "Lynn Conway",
    initials: "LC",
    avatar: "https://cdn.21st.dev/assets/mirror/18/180230dbb986388292eb6d932d540e9ca8b6507332837bbe9787b53750202f50.jpg",
    email: "lynn@acme.io",
    status: "Invited",
    role: "Viewer",
    joined: "2026-02-19",
  },
  {
    id: "m-26",
    name: "Ralph Merkle",
    initials: "RM",
    avatar: "https://cdn.21st.dev/assets/mirror/2b/2b7b08655f93dbb0d950da430b1e251dcfede184e47d81a2c425514cd529b0fe.jpg",
    email: "ralph@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-02-13",
  },
  {
    id: "m-27",
    name: "Carol Shaw",
    initials: "CS",
    avatar: "https://cdn.21st.dev/assets/mirror/ff/ff69e06d986306dd387813d2e4f8afda62c6ee5f9fbc7bb83dc69b323b9d3869.jpg",
    email: "carol@acme.io",
    status: "Active",
    role: "Viewer",
    joined: "2026-02-08",
  },
  {
    id: "m-28",
    name: "Niklaus Wirth",
    initials: "NW",
    avatar: "https://cdn.21st.dev/assets/mirror/c7/c7fd0eae06d8b2f2206a917d3070941d0c80788f5ab4a6f7ca965b7578808315.jpg",
    email: "niklaus@acme.io",
    status: "Inactive",
    role: "Viewer",
    joined: "2026-02-02",
  },
  {
    id: "m-29",
    name: "Mary Allen Wilkes",
    initials: "MW",
    avatar: "https://cdn.21st.dev/assets/mirror/ab/ab722ff8c1974de12354394a66ec1f925a8ee93f51000eb94462689b4be46c0f.jpg",
    email: "mary@acme.io",
    status: "Active",
    role: "Admin",
    joined: "2026-01-27",
  },
  {
    id: "m-30",
    name: "Leslie Lamport",
    initials: "LL",
    avatar: "https://cdn.21st.dev/assets/mirror/a5/a5143cae91db22fb5fc4e9edfb4d6ba000d0f2b35db29caf386cc6bc8304e12f.jpg",
    email: "leslie@acme.io",
    status: "Active",
    role: "Editor",
    joined: "2026-01-21",
  },
];

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFmt.format(parsed);
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return (
      <IconPlaceholder
        lucide="ArrowUp"
        tabler="IconArrowUp"
        hugeicons="ArrowUpIcon"
        phosphor="ArrowUp"
        remixicon="RiArrowUpLine"
        className="size-3.5"
        aria-hidden="true"
      />
    );
  if (sorted === "desc")
    return (
      <IconPlaceholder
        lucide="ArrowDown"
        tabler="IconArrowDown"
        hugeicons="ArrowDownIcon"
        phosphor="ArrowDown"
        remixicon="RiArrowDownLine"
        className="size-3.5"
        aria-hidden="true"
      />
    );
  return (
    <IconPlaceholder
      lucide="ChevronsUpDown"
      tabler="IconArrowsVertical"
      hugeicons="ArrowUpDownIcon"
      phosphor="CaretUpDown"
      remixicon="RiExpandUpDownLine"
      className="size-3.5 text-muted-foreground/60"
      aria-hidden="true"
    />
  );
}

const columns: ColumnDef<typeof TABLE_FEATURES, Member>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(checked === true)
        }
        aria-label="Select all members on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        aria-label={`Select ${row.original.name}`}
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        Member
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    filterFn: (row, _id, value: string) => {
      const q = value.toLowerCase();
      return (
        row.original.name.toLowerCase().includes(q) ||
        row.original.email.toLowerCase().includes(q)
      );
    },
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="sm" className="shrink-0 border border-border">
            <AvatarImage
              src={member.avatar}
              alt={member.name}
              className="grayscale"
            />
            <AvatarFallback className="text-xs">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm leading-tight font-medium">
              {member.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {member.email}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    enableSorting: false,
    header: () => (
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Status
      </span>
    ),
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]} className="text-xs">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        Role
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => (
      <span className={cn("text-sm", roleClass[row.original.role])}>
        {row.original.role}
      </span>
    ),
  },
  {
    accessorKey: "joined",
    sortFn: "datetime",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        Joined
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="block text-right text-xs text-muted-foreground tabular-nums">
        {formatDate(row.original.joined)}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.original.name}`}
              >
                <IconPlaceholder
                  lucide="Ellipsis"
                  tabler="IconDots"
                  hugeicons="MoreHorizontalIcon"
                  phosphor="DotsThree"
                  remixicon="RiMoreLine"
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <IconPlaceholder
                lucide="User"
                tabler="IconUser"
                hugeicons="UserIcon"
                phosphor="User"
                remixicon="RiUserLine"
                aria-hidden="true"
              />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconPlaceholder
                lucide="Pencil"
                tabler="IconPencil"
                hugeicons="PencilIcon"
                phosphor="Pencil"
                remixicon="RiPencilLine"
                aria-hidden="true"
              />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <IconPlaceholder
                lucide="Trash"
                tabler="IconTrash"
                hugeicons="Delete02Icon"
                phosphor="Trash"
                remixicon="RiDeleteBinLine"
                aria-hidden="true"
              />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export default function TableBlock() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "joined", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState(members);

  const table = useTable({
    features: TABLE_FEATURES,
    data,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageIndex: 0, pageSize: 6 } },
  });

  const nameFilter =
    (table.getColumn("name")?.getFilterValue() as string) ?? "";
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  function handleRemove() {
    const selectedIds = new Set(
      table.getFilteredSelectedRowModel().rows.map((row) => row.id),
    );
    setData((prev) => prev.filter((row) => !selectedIds.has(row.id)));
    table.resetRowSelection();
    toast("Members removed", {
      description: `${selectedIds.size} ${
        selectedIds.size === 1 ? "member" : "members"
      } removed from the workspace.`,
    });
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
              <IconPlaceholder
                lucide="UserCog"
                tabler="IconShield"
                hugeicons="ShieldUserIcon"
                phosphor="Shield"
                remixicon="RiShieldUserLine"
                className="size-4"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="font-heading text-lg leading-tight font-semibold tracking-tight">
                Team Members
              </h1>
              <p className="text-sm text-muted-foreground">
                {data.length} members across 3 workspaces
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <IconPlaceholder
                lucide="Search"
                tabler="IconSearch"
                hugeicons="SearchIcon"
                phosphor="MagnifyingGlass"
                remixicon="RiSearchLine"
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={nameFilter}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                placeholder="Search members..."
                className="h-7 w-48 pl-8 text-sm"
                aria-label="Search members by name or email"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Toggle columns"
                  >
                    <IconPlaceholder
                      lucide="Columns"
                      tabler="IconColumns"
                      hugeicons="LayoutLeftIcon"
                      phosphor="Columns"
                      remixicon="RiLayoutColumnLine"
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    View
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(checked === true)
                        }
                        closeOnClick={false}
                      >
                        {COLUMN_LABELS[column.id] ?? column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm">
              <IconPlaceholder
                lucide="Plus"
                tabler="IconPlus"
                hugeicons="Add01Icon"
                phosphor="Plus"
                remixicon="RiAddLine"
                className="mr-1 size-3.5"
                aria-hidden="true"
              />
              Invite
            </Button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground tabular-nums">
                {selectedCount} Selected
              </span>
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => table.resetRowSelection()}
              >
                Clear
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast("Export started", {
                    description: `Exporting ${selectedCount} members to CSV.`,
                  })
                }
              >
                <IconPlaceholder
                  lucide="Download"
                  tabler="IconDownload"
                  hugeicons="DownloadIcon"
                  phosphor="Download"
                  remixicon="RiDownloadLine"
                  className="size-3.5"
                  aria-hidden="true"
                />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast("Role updated", {
                    description: `Changed the role for ${selectedCount} members.`,
                  })
                }
              >
                <IconPlaceholder
                  lucide="UserCog"
                  tabler="IconUserCog"
                  hugeicons="UserSettingsIcon"
                  phosphor="UserGear"
                  remixicon="RiUserSettingsLine"
                  className="size-3.5"
                  aria-hidden="true"
                />
                Change role
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleRemove}
              >
                <IconPlaceholder
                  lucide="Trash"
                  tabler="IconTrash"
                  hugeicons="Delete02Icon"
                  phosphor="Trash"
                  remixicon="RiDeleteBinLine"
                  className="size-3.5"
                  aria-hidden="true"
                />
                Remove
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border bg-muted/40 hover:bg-muted/40"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-9",
                        header.column.id === "select" && "w-10 pl-4",
                        header.column.id === "name" && "pl-1",
                        header.column.id === "joined" && "text-right",
                        header.column.id === "actions" && "w-10 pr-4",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="border-b border-border transition-colors duration-100 last:border-b-0 hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3",
                          cell.column.id === "select" && "pl-4",
                          cell.column.id === "name" && "pl-1",
                          cell.column.id === "actions" && "pr-4",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No members match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{totalCount}</span>{" "}
              {totalCount === 1 ? "Result" : "Results"}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <IconPlaceholder
                  lucide="ChevronLeft"
                  tabler="IconChevronLeft"
                  hugeicons="ArrowLeft01Icon"
                  phosphor="CaretLeft"
                  remixicon="RiArrowLeftSLine"
                  className="size-3.5"
                  aria-hidden="true"
                />
              </Button>
              <span className="px-1 text-xs text-muted-foreground tabular-nums">
                Page {table.state.pagination.pageIndex + 1} of{" "}
                {Math.max(pageCount, 1)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <IconPlaceholder
                  lucide="ChevronRight"
                  tabler="IconChevronRight"
                  hugeicons="ArrowRight01Icon"
                  phosphor="CaretRight"
                  remixicon="RiArrowRightSLine"
                  className="size-3.5"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  );
}
