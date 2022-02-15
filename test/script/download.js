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
const debug_color2_1 = require("debug-color2");
const file_current = (0, path_1.join)(__root_1.__root, 'dist', 'index.json');
const file_history = (0, path_1.join)(__root_1.__root, 'dist', 'history.json');
(async () => {
    const history = await (0, fs_extra_1.readJSON)(file_history)
        .catch(() => (0, fs_extra_1.readJSON)(file_current))
        .catch(() => ({}));
    await (0, cross_fetch_1.default)('https://magic.wizards.com/en/articles/archive/magic-digital/mtg-arena-jump-in', {
        redirect: 'follow',
    })
        .then(res => res.text())
        .then(html => {
        const $ = cheerio_1.default.load(html);
        let _current;
        let record = {};
        let section = 'Jump In!';
        let sectionElem = $('.collapsibleBlock .showHideListItems');
        if (!sectionElem.length) {
            if ($('#content-detail-page-of-an-article > .bean_block_deck_list.bean--wiz-content-deck-list').length > 0) {
                sectionElem = $('#content-detail-page-of-an-article');
            }
        }
        sectionElem
            .each((index, elem) => {
            var _a, _b;
            const $root = $(elem);
            let $body;
            if ($root.is('#content-detail-page-of-an-article')) {
                $body = $root;
            }
            else {
                section = $root.find('h2 em:eq(0)').text();
                if (!(section === null || section === void 0 ? void 0 : section.length)) {
                    section = 'Jump In!';
                }
                $body = $root.find('.wrapper > div');
            }
            (_a = record[section]) !== null && _a !== void 0 ? _a : (record[section] = {});
            (_b = history[section]) !== null && _b !== void 0 ? _b : (history[section] = {});
            $body.find('.bean_block_deck_list')
                .each(((index, elemTop) => {
                const _$top = $(elemTop);
                _current = _$top.find('.title-deckicon .deck-meta h4').text();
                record[section][_current] = [];
                if (history[section][_current]) {
                    debug_color2_1.console.gray.log(section, '-', _current);
                }
                else {
                    debug_color2_1.console.green.log(section, '-', _current);
                }
                let $body = _$top.find('.deck-list-text')
                    .find('.sorted-by-rarity-container, .sorted-by-cost-container, .sorted-by-color-container, .sorted-by-overview-container')
                    .eq(0);
                $body.find('.row:has(.card-name)').each((index, elem) => {
                    const $this = $(elem);
                    let amount = $this.find('.card-count').text();
                    let $a = $this.find('.card-name a');
                    if (!$a.length) {
                        $a = $this.find('.card-name');
                    }
                    let set = $a.attr('data-cardexpansion');
                    let name = $a.text();
                    if (name === null || name === void 0 ? void 0 : name.length) {
                        record[section][_current].push({
                            name,
                            amount,
                            set,
                        });
                    }
                });
                const _$top2 = _$top.nextAll('script + table').eq(0);
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
                history[section][_current] = record[section][_current];
            }));
        });
        if (!Object.keys(record).length) {
            throw new Error(`can't parse any packet lists`);
        }
        /*
        console.dir(record, {
            depth: null,
        })
         */
        return Promise.all([
            (0, fs_extra_1.outputJSON)(file_current, record, {
                spaces: 2,
            }),
            (0, fs_extra_1.outputJSON)(file_history, history, {
                spaces: 2,
            }),
        ]);
    });
})();
//# sourceMappingURL=download.js.map