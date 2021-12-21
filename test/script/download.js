"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const __root_1 = require("../__root");
(0, cross_fetch_1.default)('https://magic.wizards.com/en/articles/archive/magic-digital/mtg-arena-jump-in')
    .then(res => res.text())
    .then(html => {
    const $ = cheerio_1.default.load(html);
    let _current;
    let record = {};
    let section = 'Jump In!';
    $('.collapsibleBlock .showHideListItems')
        .each((index, elem) => {
        var _a;
        const $root = $(elem);
        section = $root.find('h2 em:eq(0)').text();
        if (!(section === null || section === void 0 ? void 0 : section.length)) {
            section = 'Jump In!';
        }
        (_a = record[section]) !== null && _a !== void 0 ? _a : (record[section] = {});
        const $body = $root.find('.wrapper > div');
        $body.find('.bean_block_deck_list')
            .each(((index, elemTop) => {
            const _$top = $(elemTop);
            _current = _$top.find('.title-deckicon .deck-meta h4').text();
            record[section][_current] = [];
            console.log(section, '-', _current);
            let $body = _$top.find('.deck-list-text')
                .find('.sorted-by-rarity-container, .sorted-by-cost-container, .sorted-by-color-container, .sorted-by-overview-container')
                .eq(0);
            $body.find('.row:has(.card-name)').each((index, elem) => {
                const $this = $(elem);
                let amount = $this.find('.card-count').text();
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
            if (!_$top2.length) {
                throw new Error();
            }
            let name;
            let idx = 0;
            _$top2.find('tbody > tr > td')
                .each((index, elem) => {
                const $this = $(elem);
                const $a = $this.find('a');
                //console.log(name, idx % 2)
                if (idx % 2) {
                    if (name === null || name === void 0 ? void 0 : name.length) {
                        let appears = $this.text().trim();
                        if (/(\d+%)/.test(appears)) {
                            appears = RegExp.$1;
                        }
                        else {
                            appears = void 0;
                        }
                        record[section][_current].push({
                            name,
                            appears,
                        });
                        name = void 0;
                    }
                }
                else {
                    if ($a.length) {
                        name = $a.text();
                    }
                    else {
                        name = $this.text();
                    }
                    name = name.trim();
                    if (name.length <= 1) {
                        name = void 0;
                    }
                }
                idx++;
            });
        }));
    });
    /*
    console.dir(record, {
        depth: null,
    })
     */
    return (0, fs_extra_1.outputJSON)((0, path_1.join)(__root_1.__root, 'dist', 'index.json'), record, {
        spaces: 2,
    });
});
//# sourceMappingURL=download.js.map