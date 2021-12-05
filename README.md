# README.md

    MTG Arena Jump In! Packets Json Data

## install

```bash
yarn add mtg-jump-in
yarn-tool add mtg-jump-in
yt add mtg-jump-in
```

```typescript
declare let record: Record<string, Record<string, {
    name: string;
    amount?: `${number}`;
    set?: string;
    appears?: `${number}%`;
}[]>>;
export = record;
```
