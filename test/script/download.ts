import fetch from 'cross-fetch';
import cheerio from 'cheerio';
import { outputJSON, readJSON } from 'fs-extra';
import { join } from 'path';
import { __root } from '../__root';
import * as JumpInRecord from '../../dist/index';
import { console } from 'debug-color2';

const file_current = join(__root, 'dist', 'index.json');
const file_history = join(__root, 'dist', 'history.json');

type IJumpInRecord = typeof JumpInRecord;

(async () =>
{

	const history: IJumpInRecord = await readJSON(file_history)
		.catch(() => readJSON(file_current))
		.catch(() => ({}))
	;

	await fetch('https://magic.wizards.com/en/articles/archive/magic-digital/mtg-arena-jump-in')
		.then(res => res.text())
		.then(html =>
		{
			const $ = cheerio.load(html);

			let _current: string;

			let record: IJumpInRecord = {};

			let section: string = 'Jump In!';

			$('.collapsibleBlock .showHideListItems')
				.each((index, elem) =>
				{
					const $root = $(elem);

					section = $root.find('h2 em:eq(0)').text();
					if (!section?.length)
					{
						section = 'Jump In!';
					}

					record[section] ??= {};
					history[section] ??= {};

					const $body = $root.find('.wrapper > div');

					$body.find('.bean_block_deck_list')
						.each(((index, elemTop) =>
						{
							const _$top = $(elemTop);

							_current = _$top.find('.title-deckicon .deck-meta h4').text();

							record[section][_current] = [];

							if (history[section][_current])
							{
								console.gray.log(section, '-', _current);
							}
							else
							{
								console.green.log(section, '-', _current);
							}

							let $body = _$top.find('.deck-list-text')
								.find('.sorted-by-rarity-container, .sorted-by-cost-container, .sorted-by-color-container, .sorted-by-overview-container')
								.eq(0);

							$body.find('.row:has(.card-name)').each((index, elem) =>
							{
								const $this = $(elem);

								let amount = $this.find('.card-count').text() as any;

								let $a = $this.find('.card-name a');

								let set = $a.attr('data-cardexpansion');
								let name = $a.text();

								record[section][_current].push({
									name,
									amount,
									set,
								});
							});

							const _$top2 = _$top.siblings('script + table').eq(0);

							if (!_$top2.length)
							{
								throw new Error()
							}

							let name: string;

							let idx = 0;

							_$top2.find('tbody > tr > td')
								.each((index, elem) =>
								{
									const $this = $(elem);

									const $a = $this.find('a');

									//console.log(name, idx % 2)

									if (idx % 2)
									{
										if (name?.length)
										{
											let appears = $this.text().trim() as any;

											if (/(\d+%)/.test(appears))
											{
												appears = RegExp.$1;
											}
											else
											{
												appears = void 0;
											}

											record[section][_current].push({
												name,
												appears,
											});

											name = void 0;
										}
									}
									else
									{
										if ($a.length)
										{
											name = $a.text();
										}
										else
										{
											name = $this.text();
										}

										name = name.trim();

										if (name.length <= 1)
										{
											name = void 0;
										}
									}

									idx++;
								})
							;

							history[section][_current] = record[section][_current];

						}))
					;

				})
			;

			/*
			console.dir(record, {
				depth: null,
			})
			 */

			return Promise.all([
				outputJSON(file_current, record, {
					spaces: 2,
				}),
				outputJSON(file_history, record, {
					spaces: 2,
				}),
			])
		})
	;

})();
