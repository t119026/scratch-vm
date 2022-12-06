const formatMessage = require('format-message');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

/**
 * Enum for temperature data parameter
 * @readonly
 * @enum {string}
 */
const YearDataParam = {
    Y2010: 'y2010', Y2011: 'y2011', Y2012: 'y2012', Y2013: 'y2013', Y2014: 'y2014',
    Y2015: 'y2015', Y2016: 'y2016', Y2017: 'y2017', Y2018: 'y2018', Y2019: 'y2019'
};

/**
 * Enum for area data parameter
 * @readonly
 * @enum {string}
 */
const AreaParam = {
    SAPPORO: 'sapporo',
    SENDAI: 'sendai',
    TOKYO: 'tokyo',
    SUWA: 'suwa',
    NAGOYA: 'nagoya',
    OSAKA: 'osaka',
    FUKUOKA: 'fukuoka',
    NAHA: 'naha'
};

class Scratch3WetherData {
    constructor(runtime) {
        this.runtime = runtime;

        // 各地域の気象データを格納
        // 札幌(北韓道)
        this._sapporo = [
            [
                {month: 1, temperature: 0.7, precipitation: 112, sunshine: 82.8},
                {month: 2, temperature: -0.3, precipitation: 59.5, sunshine: 92.6},
                {month: 3, temperature: 3.1, precipitation: 79.5, sunshine: 114.5},
                {month: 4, temperature: 9.3, precipitation: 67.5, sunshine: 124.3},
                {month: 5, temperature: 16.8, precipitation: 44.5, sunshine: 186.7},
                {month: 6, temperature: 24.6, precipitation: 73, sunshine: 222.7},
                {month: 7, temperature: 25.8, precipitation: 143.5, sunshine: 73.9},
                {month: 8, temperature: 29.1, precipitation: 213.5, sunshine: 158.4},
                {month: 9, temperature: 24.2, precipitation: 92, sunshine: 181.3},
                {month: 10, temperature: 16.4, precipitation: 130.5, sunshine: 144.4},
                {month: 11, temperature: 9.4, precipitation: 194.5, sunshine: 89.5},
                {month: 12, temperature: 3.4, precipitation: 115, sunshine: 55.8}
            ], 
            [
                {month: 1, temperature: -1.2, precipitation: 120, sunshine: 115.5},
                {month: 2, temperature: 2.4, precipitation: 69.5, sunshine: 140.8},
                {month: 3, temperature: 4.1, precipitation: 60.5, sunshine: 159.7},
                {month: 4, temperature: 11.3, precipitation: 69.5, sunshine: 164.6},
                {month: 5, temperature: 15.4, precipitation: 56.5, sunshine: 158.6},
                {month: 6, temperature: 22, precipitation: 43, sunshine: 164.6},
                {month: 7, temperature: 26, precipitation: 129, sunshine: 170.2},
                {month: 8, temperature: 27.9, precipitation: 109, sunshine: 214.4},
                {month: 9, temperature: 23.3, precipitation: 257.5, sunshine: 127.4},
                {month: 10, temperature: 16.6, precipitation: 146, sunshine: 129.9},
                {month: 11, temperature: 9.6, precipitation: 86, sunshine: 116.5},
                {month: 12, temperature: 0.8, precipitation: 107, sunshine: 91.4}
            ], 
            [
                {month: 1, temperature: -1.6, precipitation: 71.5, sunshine: 131.5},
                {month: 2, temperature: -1.3, precipitation: 57, sunshine: 133.8},
                {month: 3, temperature: 3.4, precipitation: 44.5, sunshine: 143.6},
                {month: 4, temperature: 11.5, precipitation: 34.5, sunshine: 166.2},
                {month: 5, temperature: 17.7, precipitation: 83.5, sunshine: 207.2},
                {month: 6, temperature: 22.1, precipitation: 51.5, sunshine: 215.6},
                {month: 7, temperature: 26.4, precipitation: 81.5, sunshine: 205.6},
                {month: 8, temperature: 27.2, precipitation: 121, sunshine: 146.7},
                {month: 9, temperature: 26.5, precipitation: 191, sunshine: 166.2},
                {month: 10, temperature: 17, precipitation: 115, sunshine: 153.2},
                {month: 11, temperature: 8.2, precipitation: 219, sunshine: 79.5},
                {month: 12, temperature: 0.4, precipitation: 209, sunshine: 70.5}
            ], 
            [
                {month: 1, temperature: -2, precipitation: 101.5, sunshine: 111.2},
                {month: 2, temperature: -0.9, precipitation: 117, sunshine: 111.1},
                {month: 3, temperature: 3.4, precipitation: 108, sunshine: 116.1},
                {month: 4, temperature: 9.8, precipitation: 115, sunshine: 128.1},
                {month: 5, temperature: 15.7, precipitation: 61.5, sunshine: 142.1},
                {month: 6, temperature: 23, precipitation: 62, sunshine: 233.2},
                {month: 7, temperature: 27.1, precipitation: 54.5, sunshine: 215.4},
                {month: 8, temperature: 27.1, precipitation: 183.5, sunshine: 142},
                {month: 9, temperature: 22.9, precipitation: 173, sunshine: 149.6},
                {month: 10, temperature: 16.8, precipitation: 131, sunshine: 125.2},
                {month: 11, temperature: 10.1, precipitation: 116, sunshine: 98.7},
                {month: 12, temperature: 3.2, precipitation: 124, sunshine: 75.2}
            ], 
            [
                {month: 1, temperature: -1, precipitation: 111.5, sunshine: 87.8},
                {month: 2, temperature: -0.3, precipitation: 89, sunshine: 118.8},
                {month: 3, temperature: 3.7, precipitation: 64, sunshine: 155.5},
                {month: 4, temperature: 12.7, precipitation: 24, sunshine: 257.8},
                {month: 5, temperature: 19.7, precipitation: 60, sunshine: 207.7},
                {month: 6, temperature: 23.3, precipitation: 99, sunshine: 182.4},
                {month: 7, temperature: 27, precipitation: 76.5, sunshine: 214.3},
                {month: 8, temperature: 26.6, precipitation: 217.5, sunshine: 178.9},
                {month: 9, temperature: 22.8, precipitation: 146, sunshine: 188.8},
                {month: 10, temperature: 15.7, precipitation: 124, sunshine: 145.4},
                {month: 11, temperature: 10.2, precipitation: 64, sunshine: 109},
                {month: 12, temperature: 1.7, precipitation: 128, sunshine: 66.3}
            ], 
            [
                {month: 1, temperature: 1.2, precipitation: 143.5, sunshine: 102.5},
                {month: 2, temperature: 1.9, precipitation: 59.5, sunshine: 95.4},
                {month: 3, temperature: 7.3, precipitation: 125.5, sunshine: 144},
                {month: 4, temperature: 13.7, precipitation: 90, sunshine: 220.4},
                {month: 5, temperature: 19.6, precipitation: 37, sunshine: 263.2},
                {month: 6, temperature: 21, precipitation: 66.5, sunshine: 151.4},
                {month: 7, temperature: 26, precipitation: 64, sunshine: 175},
                {month: 8, temperature: 26.4, precipitation: 131.5, sunshine: 158.6},
                {month: 9, temperature: 22.5, precipitation: 198, sunshine: 151.8},
                {month: 10, temperature: 15.2, precipitation: 98, sunshine: 150.9},
                {month: 11, temperature: 8.6, precipitation: 137, sunshine: 108.2},
                {month: 12, temperature: 3.7, precipitation: 124, sunshine: 91.6}
            ], 
            [
                {month: 1, temperature: -1.3, precipitation: 74, sunshine: 88.2},
                {month: 2, temperature: 0.7, precipitation: 109.5, sunshine: 99.3},
                {month: 3, temperature: 5.8, precipitation: 60.5, sunshine: 164.1},
                {month: 4, temperature: 12.4, precipitation: 58.5, sunshine: 174.9},
                {month: 5, temperature: 20.3, precipitation: 40.5, sunshine: 229.5},
                {month: 6, temperature: 20.3, precipitation: 112.5, sunshine: 157.7},
                {month: 7, temperature: 25, precipitation: 118.5, sunshine: 211.1},
                {month: 8, temperature: 28.3, precipitation: 279, sunshine: 225.3},
                {month: 9, temperature: 23.6, precipitation: 107, sunshine: 155},
                {month: 10, temperature: 14.6, precipitation: 78, sunshine: 145},
                {month: 11, temperature: 5.4, precipitation: 115.5, sunshine: 89.6},
                {month: 12, temperature: 2.1, precipitation: 206.5, sunshine: 78.8}
            ], 
            [
                {month: 1, temperature: -1.1, precipitation: 72.5, sunshine: 77.2},
                {month: 2, temperature: 1, precipitation: 57.5, sunshine: 87},
                {month: 3, temperature: 4.5, precipitation: 75.5, sunshine: 184.1},
                {month: 4, temperature: 12.3, precipitation: 65.5, sunshine: 193.2},
                {month: 5, temperature: 19.7, precipitation: 57.5, sunshine: 212.4},
                {month: 6, temperature: 20.7, precipitation: 168.5, sunshine: 165.8},
                {month: 7, temperature: 27.7, precipitation: 75.5, sunshine: 200.8},
                {month: 8, temperature: 25.8, precipitation: 78.5, sunshine: 184.4},
                {month: 9, temperature: 22.5, precipitation: 187, sunshine: 183.3},
                {month: 10, temperature: 15.4, precipitation: 114, sunshine: 152.9},
                {month: 11, temperature: 7.7, precipitation: 129, sunshine: 94},
                {month: 12, temperature: 0.8, precipitation: 77, sunshine: 84.8}
            ], 
            [
                {month: 1, temperature: 0, precipitation: 99.5, sunshine: 88.4},
                {month: 2, temperature: -1, precipitation: 43, sunshine: 115.3},
                {month: 3, temperature: 6.1, precipitation: 115.5, sunshine: 159.1},
                {month: 4, temperature: 13, precipitation: 36.5, sunshine: 184.1},
                {month: 5, temperature: 18.3, precipitation: 66, sunshine: 205.4},
                {month: 6, temperature: 21.1, precipitation: 141.5, sunshine: 160.1},
                {month: 7, temperature: 25.7, precipitation: 155.5, sunshine: 177.4},
                {month: 8, temperature: 25, precipitation: 228.5, sunshine: 123.4},
                {month: 9, temperature: 23.1, precipitation: 49.5, sunshine: 184.4},
                {month: 10, temperature: 17.7, precipitation: 187, sunshine: 161.4},
                {month: 11, temperature: 9.6, precipitation: 73, sunshine: 106.8},
                {month: 12, temperature: 1.4, precipitation: 86.5, sunshine: 75.8}
            ], 
            [
                {month: 1, temperature: -0.2, precipitation: 86, sunshine: 102.5},
                {month: 2, temperature: 0.3, precipitation: 32.5, sunshine: 114.1},
                {month: 3, temperature: 6.1, precipitation: 39, sunshine: 157.3},
                {month: 4, temperature: 13.3, precipitation: 30.5, sunshine: 223.4},
                {month: 5, temperature: 21.8, precipitation: 29.5, sunshine: 270.8},
                {month: 6, temperature: 22.4, precipitation: 71, sunshine: 193.1},
                {month: 7, temperature: 26.1, precipitation: 31.5, sunshine: 185.1},
                {month: 8, temperature: 26.5, precipitation: 144.5, sunshine: 164.6},
                {month: 9, temperature: 24, precipitation: 108.5, sunshine: 208.5},
                {month: 10, temperature: 17.5, precipitation: 97, sunshine: 158.6},
                {month: 11, temperature: 7.7, precipitation: 82, sunshine: 121.5},
                {month: 12, temperature: 2.6, precipitation: 62, sunshine: 88.2}
            ]          
        ];
        // 仙台(宮城)
        this._sendai = [
            [
                {month: 1, temperature: 6.8, precipitation: 4, sunshine: 155.7},
                {month: 2, temperature: 6, precipitation: 24.5, sunshine: 118.6},
                {month: 3, temperature: 8.5, precipitation: 89.5, sunshine: 141.1},
                {month: 4, temperature: 12.2, precipitation: 163.5, sunshine: 131.1},
                {month: 5, temperature: 19, precipitation: 182, sunshine: 190.7},
                {month: 6, temperature: 24.4, precipitation: 146.5, sunshine: 168.9},
                {month: 7, temperature: 29.6, precipitation: 134, sunshine: 168.6},
                {month: 8, temperature: 31.4, precipitation: 37.5, sunshine: 187.1},
                {month: 9, temperature: 25.4, precipitation: 248, sunshine: 124.3},
                {month: 10, temperature: 20, precipitation: 124.5, sunshine: 112.5},
                {month: 11, temperature: 14.6, precipitation: 40, sunshine: 153.5},
                {month: 12, temperature: 9.5, precipitation: 250, sunshine: 134.8}
            ], 
            [
                {month: 1, temperature: 3.9, precipitation: 8.5, sunshine: 158.8},
                {month: 2, temperature: 7.6, precipitation: 52, sunshine: 175.3},
                {month: 3, temperature: 8.4, precipitation: 43.5, sunshine: 179.7},
                {month: 4, temperature: 15.3, precipitation: 55, sunshine: 212.1},
                {month: 5, temperature: 20.4, precipitation: 222.5, sunshine: 191.5},
                {month: 6, temperature: 25, precipitation: 135, sunshine: 184},
                {month: 7, temperature: 29, precipitation: 96.5, sunshine: 159.2},
                {month: 8, temperature: 28.6, precipitation: 51, sunshine: 130.4},
                {month: 9, temperature: 26.2, precipitation: 362.5, sunshine: 136.4},
                {month: 10, temperature: 20.4, precipitation: 107, sunshine: 171.2},
                {month: 11, temperature: 14.9, precipitation: 35, sunshine: 141},
                {month: 12, temperature: 7, precipitation: 45.5, sunshine: 150.5}
            ], 
            [
                {month: 1, temperature: 3.8, precipitation: 22.5, sunshine: 154.1},
                {month: 2, temperature: 4.2, precipitation: 44, sunshine: 150.3},
                {month: 3, temperature: 9, precipitation: 123.5, sunshine: 153.9},
                {month: 4, temperature: 14.2, precipitation: 57, sunshine: 166.9},
                {month: 5, temperature: 20.3, precipitation: 224, sunshine: 188.3},
                {month: 6, temperature: 22.2, precipitation: 207, sunshine: 158.9},
                {month: 7, temperature: 26.6, precipitation: 164, sunshine: 128.3},
                {month: 8, temperature: 30.8, precipitation: 24.5, sunshine: 200.2},
                {month: 9, temperature: 28, precipitation: 130, sunshine: 176.5},
                {month: 10, temperature: 21.1, precipitation: 82.5, sunshine: 172.3},
                {month: 11, temperature: 13.5, precipitation: 58, sunshine: 115.7},
                {month: 12, temperature: 6.8, precipitation: 42.5, sunshine: 143.6}
            ], 
            [
                {month: 1, temperature: 4.2, precipitation: 37, sunshine: 170.8},
                {month: 2, temperature: 5, precipitation: 18.5, sunshine: 147.7},
                {month: 3, temperature: 11, precipitation: 3, sunshine: 187.4},
                {month: 4, temperature: 14.9, precipitation: 118.5, sunshine: 195.4},
                {month: 5, temperature: 19.7, precipitation: 27.5, sunshine: 228.4},
                {month: 6, temperature: 23.1, precipitation: 92, sunshine: 151.6},
                {month: 7, temperature: 25.6, precipitation: 257.5, sunshine: 64.4},
                {month: 8, temperature: 30, precipitation: 88.5, sunshine: 198.7},
                {month: 9, temperature: 25.7, precipitation: 210.5, sunshine: 138.1},
                {month: 10, temperature: 20.3, precipitation: 179.5, sunshine: 107.4},
                {month: 11, temperature: 14.1, precipitation: 14, sunshine: 159.9},
                {month: 12, temperature: 8.3, precipitation: 65, sunshine: 129.7}
            ], 
            [
                {month: 1, temperature: 6.2, precipitation: 18, sunshine: 183},
                {month: 2, temperature: 5.2, precipitation: 78.5, sunshine: 152.4},
                {month: 3, temperature: 9.8, precipitation: 162.5, sunshine: 157.8},
                {month: 4, temperature: 16.3, precipitation: 69, sunshine: 262.7},
                {month: 5, temperature: 21.5, precipitation: 83.5, sunshine: 244},
                {month: 6, temperature: 24.3, precipitation: 242, sunshine: 137.9},
                {month: 7, temperature: 27.8, precipitation: 123, sunshine: 159.2},
                {month: 8, temperature: 28.6, precipitation: 133, sunshine: 137.9},
                {month: 9, temperature: 25.1, precipitation: 112, sunshine: 192.8},
                {month: 10, temperature: 20, precipitation: 256.5, sunshine: 188.4},
                {month: 11, temperature: 14, precipitation: 70.5, sunshine: 143.6},
                {month: 12, temperature: 6.6, precipitation: 68, sunshine: 133.7}
            ], 
            [
                {month: 1, temperature: 5.9, precipitation: 41.5, sunshine: 152},
                {month: 2, temperature: 6.4, precipitation: 30, sunshine: 139.1},
                {month: 3, temperature: 11.4, precipitation: 184.5, sunshine: 210},
                {month: 4, temperature: 16.9, precipitation: 100.5, sunshine: 204},
                {month: 5, temperature: 23.5, precipitation: 45, sunshine: 273.3},
                {month: 6, temperature: 24.2, precipitation: 130.5, sunshine: 167.5},
                {month: 7, temperature: 29, precipitation: 54.5, sunshine: 191.1},
                {month: 8, temperature: 27.9, precipitation: 219.5, sunshine: 129.6},
                {month: 9, temperature: 24.4, precipitation: 441, sunshine: 136.6},
                {month: 10, temperature: 20.4, precipitation: 8, sunshine: 215.8},
                {month: 11, temperature: 14.7, precipitation: 144.5, sunshine: 130},
                {month: 12, temperature: 9.5, precipitation: 45, sunshine: 153.8}
            ], 
            [
                {month: 1, temperature: 6.2, precipitation: 67.5, sunshine: 126.6},
                {month: 2, temperature: 8.1, precipitation: 17.5, sunshine: 157.7},
                {month: 3, temperature: 11.7, precipitation: 8.5, sunshine: 193},
                {month: 4, temperature: 16.5, precipitation: 180, sunshine: 192.3},
                {month: 5, temperature: 21.8, precipitation: 87.5, sunshine: 208.1},
                {month: 6, temperature: 23.8, precipitation: 157.5, sunshine: 151.9},
                {month: 7, temperature: 26.6, precipitation: 56, sunshine: 130.5},
                {month: 8, temperature: 29.9, precipitation: 226.5, sunshine: 180.3},
                {month: 9, temperature: 25.4, precipitation: 314, sunshine: 92.2},
                {month: 10, temperature: 20.4, precipitation: 26.5, sunshine: 178.3},
                {month: 11, temperature: 12.7, precipitation: 36, sunshine: 141.6},
                {month: 12, temperature: 10, precipitation: 31.5, sunshine: 143.2}
            ], 
            [
                {month: 1, temperature: 6.2, precipitation: 18, sunshine: 160.7},
                {month: 2, temperature: 7.3, precipitation: 15, sunshine: 157.7},
                {month: 3, temperature: 9.6, precipitation: 77.5, sunshine: 173.4},
                {month: 4, temperature: 16.7, precipitation: 101, sunshine: 200.9},
                {month: 5, temperature: 21.6, precipitation: 137, sunshine: 211.4},
                {month: 6, temperature: 22.9, precipitation: 80.5, sunshine: 179.7},
                {month: 7, temperature: 29.3, precipitation: 182, sunshine: 181.8},
                {month: 8, temperature: 25.9, precipitation: 219, sunshine: 57.1},
                {month: 9, temperature: 25.7, precipitation: 135.5, sunshine: 184.7},
                {month: 10, temperature: 18.4, precipitation: 340.5, sunshine: 96.8},
                {month: 11, temperature: 13.3, precipitation: 7.5, sunshine: 149.9},
                {month: 12, temperature: 7.4, precipitation: 7, sunshine: 155.4}
            ], 
            [
                {month: 1, temperature: 5, precipitation: 50, sunshine: 158.4},
                {month: 2, temperature: 5.8, precipitation: 25.5, sunshine: 195.2},
                {month: 3, temperature: 12.7, precipitation: 126.5, sunshine: 210.5},
                {month: 4, temperature: 17.6, precipitation: 37, sunshine: 183.8},
                {month: 5, temperature: 22.1, precipitation: 102.5, sunshine: 183.6},
                {month: 6, temperature: 24.6, precipitation: 100.5, sunshine: 173.2},
                {month: 7, temperature: 29.7, precipitation: 58.5, sunshine: 163.1},
                {month: 8, temperature: 29, precipitation: 272.5, sunshine: 161.8},
                {month: 9, temperature: 24.6, precipitation: 188.5, sunshine: 101.6},
                {month: 10, temperature: 20.8, precipitation: 68, sunshine: 157.5},
                {month: 11, temperature: 15.2, precipitation: 23.5, sunshine: 159.5},
                {month: 12, temperature: 8.5, precipitation: 29, sunshine: 150.2}
            ], 
            [
                {month: 1, temperature: 6.2, precipitation: 4, sunshine: 171.5},
                {month: 2, temperature: 8, precipitation: 13, sunshine: 161.8},
                {month: 3, temperature: 12, precipitation: 83, sunshine: 205.4},
                {month: 4, temperature: 15.4, precipitation: 90.5, sunshine: 211.2},
                {month: 5, temperature: 22.8, precipitation: 81, sunshine: 294},
                {month: 6, temperature: 22.8, precipitation: 168.5, sunshine: 156.4},
                {month: 7, temperature: 25.9, precipitation: 111.5, sunshine: 102.7},
                {month: 8, temperature: 30, precipitation: 88.5, sunshine: 144.3},
                {month: 9, temperature: 26.6, precipitation: 72.5, sunshine: 154.7},
                {month: 10, temperature: 20.7, precipitation: 644.5, sunshine: 135.2},
                {month: 11, temperature: 14.7, precipitation: 5.5, sunshine: 162.7},
                {month: 12, temperature: 9.8, precipitation: 27, sunshine: 156.1}
            ]    
        ];
        // 東京
        this._tokyo = [
            [
                {month: 1, temperature: 7, precipitation: 9, sunshine: 221.9},
                {month: 2, temperature: 6.5, precipitation: 115, sunshine: 118.3},
                {month: 3, temperature: 9.1, precipitation: 143.5, sunshine: 139.8},
                {month: 4, temperature: 12.4, precipitation: 214, sunshine: 139.9},
                {month: 5, temperature: 19, precipitation: 114, sunshine: 198.8},
                {month: 6, temperature: 23.6, precipitation: 108, sunshine: 162.5},
                {month: 7, temperature: 28, precipitation: 70, sunshine: 182.7},
                {month: 8, temperature: 29.6, precipitation: 27, sunshine: 222.6},
                {month: 9, temperature: 25.1, precipitation: 428, sunshine: 165.3},
                {month: 10, temperature: 18.9, precipitation: 211, sunshine: 81.4},
                {month: 11, temperature: 13.5, precipitation: 94.5, sunshine: 158.9},
                {month: 12, temperature: 9.9, precipitation: 145.5, sunshine: 194.9}
            ], 
            [
                {month: 1, temperature: 5.1, precipitation: 3.5, sunshine: 243.9},
                {month: 2, temperature: 7, precipitation: 151, sunshine: 148.9},
                {month: 3, temperature: 8.1, precipitation: 74, sunshine: 214.8},
                {month: 4, temperature: 14.5, precipitation: 96, sunshine: 204},
                {month: 5, temperature: 18.5, precipitation: 213.5, sunshine: 146.3},
                {month: 6, temperature: 22.8, precipitation: 116.5, sunshine: 105.1},
                {month: 7, temperature: 27.3, precipitation: 54.5, sunshine: 186.2},
                {month: 8, temperature: 27.5, precipitation: 244, sunshine: 168.9},
                {month: 9, temperature: 25.1, precipitation: 235, sunshine: 165.8},
                {month: 10, temperature: 19.5, precipitation: 119.5, sunshine: 141.3},
                {month: 11, temperature: 14.9, precipitation: 112.5, sunshine: 143.4},
                {month: 12, temperature: 7.5, precipitation: 59.5, sunshine: 187.6}
            ], 
            [
                {month: 1, temperature: 4.8, precipitation: 50, sunshine: 183},
                {month: 2, temperature: 5.4, precipitation: 94, sunshine: 148.6},
                {month: 3, temperature: 8.8, precipitation: 144.5, sunshine: 149.7},
                {month: 4, temperature: 14.5, precipitation: 118.5, sunshine: 162.4},
                {month: 5, temperature: 19.6, precipitation: 231, sunshine: 195.4},
                {month: 6, temperature: 21.4, precipitation: 185, sunshine: 125.3},
                {month: 7, temperature: 26.4, precipitation: 130, sunshine: 181.3},
                {month: 8, temperature: 29.1, precipitation: 25, sunshine: 236},
                {month: 9, temperature: 26.2, precipitation: 214.5, sunshine: 164.4},
                {month: 10, temperature: 19.4, precipitation: 154.5, sunshine: 156.6},
                {month: 11, temperature: 12.7, precipitation: 154, sunshine: 153.3},
                {month: 12, temperature: 7.3, precipitation: 69, sunshine: 166.9}
            ], 
            [
                {month: 1, temperature: 5.5, precipitation: 70, sunshine: 212.5},
                {month: 2, temperature: 6.2, precipitation: 30, sunshine: 173.7},
                {month: 3, temperature: 12.1, precipitation: 44.5, sunshine: 190.1},
                {month: 4, temperature: 15.2, precipitation: 283, sunshine: 196},
                {month: 5, temperature: 19.8, precipitation: 56, sunshine: 227.1},
                {month: 6, temperature: 22.9, precipitation: 159, sunshine: 123.9},
                {month: 7, temperature: 27.3, precipitation: 115.5, sunshine: 163.4},
                {month: 8, temperature: 29.2, precipitation: 99, sunshine: 210.6},
                {month: 9, temperature: 25.2, precipitation: 231.5, sunshine: 164.2},
                {month: 10, temperature: 19.8, precipitation: 440, sunshine: 110.4},
                {month: 11, temperature: 13.5, precipitation: 26, sunshine: 177.4},
                {month: 12, temperature: 8.3, precipitation: 59.5, sunshine: 181.8}
            ], 
            [
                {month: 1, temperature: 6.3, precipitation: 24.5, sunshine: 204.1},
                {month: 2, temperature: 5.9, precipitation: 157.5, sunshine: 139.8},
                {month: 3, temperature: 10.4, precipitation: 113.5, sunshine: 205},
                {month: 4, temperature: 15, precipitation: 155, sunshine: 218.3},
                {month: 5, temperature: 20.3, precipitation: 135.5, sunshine: 236.5},
                {month: 6, temperature: 23.4, precipitation: 311, sunshine: 143},
                {month: 7, temperature: 26.8, precipitation: 105.5, sunshine: 175.6},
                {month: 8, temperature: 27.7, precipitation: 105, sunshine: 180.9},
                {month: 9, temperature: 23.2, precipitation: 155.5, sunshine: 145.8},
                {month: 10, temperature: 19.1, precipitation: 384.5, sunshine: 135.2},
                {month: 11, temperature: 14.2, precipitation: 98.5, sunshine: 134.6},
                {month: 12, temperature: 6.7, precipitation: 62, sunshine: 185.2}
            ], 
            [
                {month: 1, temperature: 5.8, precipitation: 92.5, sunshine: 182},
                {month: 2, temperature: 5.7, precipitation: 62, sunshine: 166.9},
                {month: 3, temperature: 10.3, precipitation: 94, sunshine: 194.2},
                {month: 4, temperature: 14.5, precipitation: 129, sunshine: 149.5},
                {month: 5, temperature: 21.1, precipitation: 88, sunshine: 240.6},
                {month: 6, temperature: 22.1, precipitation: 195.5, sunshine: 137.3},
                {month: 7, temperature: 26.2, precipitation: 234.5, sunshine: 181.8},
                {month: 8, temperature: 26.7, precipitation: 103.5, sunshine: 137.6},
                {month: 9, temperature: 22.6, precipitation: 503.5, sunshine: 113.3},
                {month: 10, temperature: 18.4, precipitation: 57, sunshine: 181.3},
                {month: 11, temperature: 13.9, precipitation: 139.5, sunshine: 120.1},
                {month: 12, temperature: 9.3, precipitation: 82.5, sunshine: 162}
            ], 
            [
                {month: 1, temperature: 6.1, precipitation: 85, sunshine: 201.5},
                {month: 2, temperature: 7.2, precipitation: 57, sunshine: 160.1},
                {month: 3, temperature: 10.1, precipitation: 103, sunshine: 161.9},
                {month: 4, temperature: 15.4, precipitation: 120, sunshine: 149.2},
                {month: 5, temperature: 20.2, precipitation: 137.5, sunshine: 204.9},
                {month: 6, temperature: 22.4, precipitation: 174.5, sunshine: 139.1},
                {month: 7, temperature: 25.4, precipitation: 81.5, sunshine: 143.7},
                {month: 8, temperature: 27.1, precipitation: 414, sunshine: 156.5},
                {month: 9, temperature: 24.4, precipitation: 287, sunshine: 79.4},
                {month: 10, temperature: 18.7, precipitation: 96.5, sunshine: 119.6},
                {month: 11, temperature: 11.4, precipitation: 139, sunshine: 132.1},
                {month: 12, temperature: 8.9, precipitation: 84, sunshine: 193.7}
            ], 
            [
                {month: 1, temperature: 5.8, precipitation: 26, sunshine: 226.7},
                {month: 2, temperature: 6.9, precipitation: 15.5, sunshine: 193.7},
                {month: 3, temperature: 8.5, precipitation: 85.5, sunshine: 190.3},
                {month: 4, temperature: 14.7, precipitation: 122, sunshine: 198.8},
                {month: 5, temperature: 20, precipitation: 49, sunshine: 216.9},
                {month: 6, temperature: 22, precipitation: 106.5, sunshine: 158.8},
                {month: 7, temperature: 27.3, precipitation: 81, sunshine: 189.1},
                {month: 8, temperature: 26.4, precipitation: 141.5, sunshine: 83.7},
                {month: 9, temperature: 22.8, precipitation: 209.5, sunshine: 124.4},
                {month: 10, temperature: 16.8, precipitation: 531.5, sunshine: 94.7},
                {month: 11, temperature: 11.9, precipitation: 47, sunshine: 162.7},
                {month: 12, temperature: 6.6, precipitation: 15, sunshine: 211.1}
            ], 
            [
                {month: 1, temperature: 4.7, precipitation: 48.5, sunshine: 206.1},
                {month: 2, temperature: 5.4, precipitation: 20, sunshine: 167.3},
                {month: 3, temperature: 11.5, precipitation: 220, sunshine: 198},
                {month: 4, temperature: 17, precipitation: 109, sunshine: 201.8},
                {month: 5, temperature: 19.8, precipitation: 165.5, sunshine: 199.3},
                {month: 6, temperature: 22.4, precipitation: 155.5, sunshine: 163.1},
                {month: 7, temperature: 28.3, precipitation: 107, sunshine: 227.2},
                {month: 8, temperature: 28.1, precipitation: 86.5, sunshine: 217.4},
                {month: 9, temperature: 22.9, precipitation: 365, sunshine: 96.7},
                {month: 10, temperature: 19.1, precipitation: 61.5, sunshine: 139},
                {month: 11, temperature: 14, precipitation: 63, sunshine: 151},
                {month: 12, temperature: 8.3, precipitation: 44, sunshine: 145.3}
            ], 
            [
                {month: 1, temperature: 5.6, precipitation: 16, sunshine: 222.2},
                {month: 2, temperature: 7.2, precipitation: 42, sunshine: 138},
                {month: 3, temperature: 10.6, precipitation: 117.5, sunshine: 177.3},
                {month: 4, temperature: 13.6, precipitation: 90.5, sunshine: 194.4},
                {month: 5, temperature: 20, precipitation: 120.5, sunshine: 229.4},
                {month: 6, temperature: 21.8, precipitation: 225, sunshine: 129.5},
                {month: 7, temperature: 24.1, precipitation: 193, sunshine: 81.1},
                {month: 8, temperature: 28.4, precipitation: 110, sunshine: 187.8},
                {month: 9, temperature: 25.1, precipitation: 197, sunshine: 137.6},
                {month: 10, temperature: 19.4, precipitation: 529.5, sunshine: 112.8},
                {month: 11, temperature: 13.1, precipitation: 156.5, sunshine: 170.3},
                {month: 12, temperature: 8.5, precipitation: 76.5, sunshine: 128.6}
            ]   
        ];
        // 諏訪(長野県)
        this._suwa = [
            [
                {month: 1, temperature: -0.4, precipitation: 25.5, sunshine: 202.6},
                {month: 2, temperature: 1.4, precipitation: 92, sunshine: 128.1},
                {month: 3, temperature: 4.3, precipitation: 159.5, sunshine: 132.2},
                {month: 4, temperature: 8.1, precipitation: 122, sunshine: 166.8},
                {month: 5, temperature: 14.4, precipitation: 152, sunshine: 215},
                {month: 6, temperature: 19.8, precipitation: 182.5, sunshine: 161.5},
                {month: 7, temperature: 24, precipitation: 229, sunshine: 186.8},
                {month: 8, temperature: 25.6, precipitation: 83, sunshine: 216.6},
                {month: 9, temperature: 21.2, precipitation: 233.5, sunshine: 179},
                {month: 10, temperature: 14.3, precipitation: 122, sunshine: 128.7},
                {month: 11, temperature: 6.3, precipitation: 49.5, sunshine: 169.3},
                {month: 12, temperature: 2.9, precipitation: 53.5, sunshine: 168.5}
            ], 
            [
                {month: 1, temperature: -2.7, precipitation: 1, sunshine: 216.6},
                {month: 2, temperature: 0.9, precipitation: 87.5, sunshine: 184},
                {month: 3, temperature: 1.9, precipitation: 68, sunshine: 225.6},
                {month: 4, temperature: 8.7, precipitation: 105.5, sunshine: 228},
                {month: 5, temperature: 14.8, precipitation: 239.5, sunshine: 188.1},
                {month: 6, temperature: 20, precipitation: 88.5, sunshine: 143.1},
                {month: 7, temperature: 24.3, precipitation: 153.5, sunshine: 179.4},
                {month: 8, temperature: 23.8, precipitation: 262.5, sunshine: 175.9},
                {month: 9, temperature: 20, precipitation: 289, sunshine: 177.8},
                {month: 10, temperature: 13.2, precipitation: 91, sunshine: 192.6},
                {month: 11, temperature: 8.7, precipitation: 74.5, sunshine: 154.4},
                {month: 12, temperature: 1.3, precipitation: 7, sunshine: 180.1}
            ], 
            [
                {month: 1, temperature: -2.2, precipitation: 20.5, sunshine: 179.9},
                {month: 2, temperature: -1.3, precipitation: 105.5, sunshine: 149},
                {month: 3, temperature: 3.4, precipitation: 129.5, sunshine: 168.1},
                {month: 4, temperature: 9.7, precipitation: 81, sunshine: 185.8},
                {month: 5, temperature: 14.6, precipitation: 107.5, sunshine: 205.7},
                {month: 6, temperature: 18.9, precipitation: 135.5, sunshine: 174.1},
                {month: 7, temperature: 23.5, precipitation: 270.5, sunshine: 171.6},
                {month: 8, temperature: 24.8, precipitation: 110.5, sunshine: 253.5},
                {month: 9, temperature: 21.3, precipitation: 113, sunshine: 181.5},
                {month: 10, temperature: 13.4, precipitation: 82, sunshine: 200.7},
                {month: 11, temperature: 6.1, precipitation: 74.5, sunshine: 182.9},
                {month: 12, temperature: 0.4, precipitation: 48.5, sunshine: 164.3}
            ], 
            [
                {month: 1, temperature: -2.5, precipitation: 41.5, sunshine: 206.3},
                {month: 2, temperature: -1.6, precipitation: 69, sunshine: 179.3},
                {month: 3, temperature: 5.7, precipitation: 54, sunshine: 231.5},
                {month: 4, temperature: 9.2, precipitation: 105, sunshine: 222.3},
                {month: 5, temperature: 15.3, precipitation: 61, sunshine: 281.6},
                {month: 6, temperature: 20, precipitation: 168.5, sunshine: 143.1},
                {month: 7, temperature: 23.7, precipitation: 138.5, sunshine: 193.6},
                {month: 8, temperature: 24.7, precipitation: 222.5, sunshine: 236.3},
                {month: 9, temperature: 19.9, precipitation: 206.5, sunshine: 184.7},
                {month: 10, temperature: 15, precipitation: 146.5, sunshine: 138.1},
                {month: 11, temperature: 6.6, precipitation: 55, sunshine: 176.9},
                {month: 12, temperature: 1, precipitation: 36, sunshine: 163.5}
            ], 
            [
                {month: 1, temperature: -1.6, precipitation: 35.5, sunshine: 206.9},
                {month: 2, temperature: -1.6, precipitation: 58.5, sunshine: 188.8},
                {month: 3, temperature: 3.7, precipitation: 131.5, sunshine: 194.6},
                {month: 4, temperature: 9.7, precipitation: 46.5, sunshine: 227.8},
                {month: 5, temperature: 15.4, precipitation: 59.5, sunshine: 267.1},
                {month: 6, temperature: 19.9, precipitation: 116.5, sunshine: 172.5},
                {month: 7, temperature: 23.2, precipitation: 318, sunshine: 190.5},
                {month: 8, temperature: 23.2, precipitation: 186, sunshine: 117},
                {month: 9, temperature: 18.1, precipitation: 55, sunshine: 181.3},
                {month: 10, temperature: 13.2, precipitation: 174, sunshine: 172.4},
                {month: 11, temperature: 7.9, precipitation: 91, sunshine: 142.6},
                {month: 12, temperature: 0.4, precipitation: 97.5, sunshine: 148.9}
            ], 
            [
                {month: 1, temperature: -1.4, precipitation: 58, sunshine: 179.7},
                {month: 2, temperature: -0.1, precipitation: 16, sunshine: 182.1},
                {month: 3, temperature: 4.9, precipitation: 62.5, sunshine: 191.3},
                {month: 4, temperature: 11, precipitation: 140, sunshine: 154.2},
                {month: 5, temperature: 17.3, precipitation: 51.5, sunshine: 253.9},
                {month: 6, temperature: 18.8, precipitation: 172.5, sunshine: 173.1},
                {month: 7, temperature: 23.3, precipitation: 138.5, sunshine: 179.2},
                {month: 8, temperature: 23.8, precipitation: 194.5, sunshine: 172.9},
                {month: 9, temperature: 18.6, precipitation: 256, sunshine: 150.6},
                {month: 10, temperature: 13.1, precipitation: 39, sunshine: 237.2},
                {month: 11, temperature: 9.3, precipitation: 138.5, sunshine: 129.8},
                {month: 12, temperature: 3.9, precipitation: 39.5, sunshine: 162.7}
            ], 
            [
                {month: 1, temperature: -0.3, precipitation: 83, sunshine: 188.6},
                {month: 2, temperature: 0.9, precipitation: 85.5, sunshine: 194.7},
                {month: 3, temperature: 5, precipitation: 56.5, sunshine: 218.7},
                {month: 4, temperature: 11.8, precipitation: 121, sunshine: 191.6},
                {month: 5, temperature: 17, precipitation: 79.5, sunshine: 221.9},
                {month: 6, temperature: 19.3, precipitation: 180.5, sunshine: 162.8},
                {month: 7, temperature: 23.5, precipitation: 124, sunshine: 195.8},
                {month: 8, temperature: 24.2, precipitation: 126, sunshine: 194.7},
                {month: 9, temperature: 20.9, precipitation: 414, sunshine: 109},
                {month: 10, temperature: 14.2, precipitation: 108, sunshine: 162},
                {month: 11, temperature: 6.6, precipitation: 101, sunshine: 162.5},
                {month: 12, temperature: 2.8, precipitation: 81.5, sunshine: 180.5}
            ], 
            [
                {month: 1, temperature: -0.8, precipitation: 21, sunshine: 201.9},
                {month: 2, temperature: -0.1, precipitation: 59.5, sunshine: 198.3},
                {month: 3, temperature: 3.1, precipitation: 34.5, sunshine: 222.3},
                {month: 4, temperature: 9.6, precipitation: 93.5, sunshine: 212.4},
                {month: 5, temperature: 16.7, precipitation: 64.5, sunshine: 226.1},
                {month: 6, temperature: 18.4, precipitation: 47, sunshine: 222.9},
                {month: 7, temperature: 24.4, precipitation: 134.5, sunshine: 175.9},
                {month: 8, temperature: 24.1, precipitation: 126.5, sunshine: 164.4},
                {month: 9, temperature: 18.8, precipitation: 102, sunshine: 181.9},
                {month: 10, temperature: 13, precipitation: 341, sunshine: 111},
                {month: 11, temperature: 6.3, precipitation: 22.5, sunshine: 180.8},
                {month: 12, temperature: 0.7, precipitation: 12, sunshine: 202.7}
            ], 
            [
                {month: 1, temperature: -1.3, precipitation: 48, sunshine: 196.2},
                {month: 2, temperature: -1.1, precipitation: 20.5, sunshine: 183.5},
                {month: 3, temperature: 6.1, precipitation: 143.5, sunshine: 223},
                {month: 4, temperature: 12.3, precipitation: 153.5, sunshine: 236.6},
                {month: 5, temperature: 16.2, precipitation: 181, sunshine: 217.5},
                {month: 6, temperature: 19.9, precipitation: 134.5, sunshine: 206.2},
                {month: 7, temperature: 25.5, precipitation: 193.5, sunshine: 260.5},
                {month: 8, temperature: 25.1, precipitation: 77.5, sunshine: 230.3},
                {month: 9, temperature: 19.4, precipitation: 364.5, sunshine: 103.2},
                {month: 10, temperature: 14.3, precipitation: 49, sunshine: 186.7},
                {month: 11, temperature: 8.6, precipitation: 14.5, sunshine: 199.4},
                {month: 12, temperature: 2.9, precipitation: 49, sunshine: 163.2}
            ], 
            [
                {month: 1, temperature: -0.8, precipitation: 9.5, sunshine: 202.5},
                {month: 2, temperature: 1.1, precipitation: 27, sunshine: 184.1},
                {month: 3, temperature: 4.6, precipitation: 68, sunshine: 196.6},
                {month: 4, temperature: 9.1, precipitation: 54.5, sunshine: 197.5},
                {month: 5, temperature: 15.8, precipitation: 83.5, sunshine: 274.6},
                {month: 6, temperature: 18.8, precipitation: 177, sunshine: 162},
                {month: 7, temperature: 22.3, precipitation: 250, sunshine: 108.5},
                {month: 8, temperature: 25, precipitation: 225, sunshine: 199.4},
                {month: 9, temperature: 21.3, precipitation: 29.5, sunshine: 180.3},
                {month: 10, temperature: 15.2, precipitation: 266.5, sunshine: 121.1},
                {month: 11, temperature: 7.7, precipitation: 23.5, sunshine: 190.5},
                {month: 12, temperature: 3.3, precipitation: 51, sunshine: 144.8}
            ]        
        ];
        // 名古屋(愛知県)
        this._nagoya = [
            [
                {month: 1, temperature: 9.1, precipitation: 11.5, sunshine: 165.6},
                {month: 2, temperature: 11.5, precipitation: 137, sunshine: 138.3},
                {month: 3, temperature: 13.7, precipitation: 211, sunshine: 156.4},
                {month: 4, temperature: 18.1, precipitation: 183.5, sunshine: 161.7},
                {month: 5, temperature: 24, precipitation: 167, sunshine: 235.3},
                {month: 6, temperature: 28.6, precipitation: 259, sunshine: 163.4},
                {month: 7, temperature: 32.2, precipitation: 208.5, sunshine: 190.5},
                {month: 8, temperature: 34.1, precipitation: 63.5, sunshine: 200.1},
                {month: 9, temperature: 31, precipitation: 190.5, sunshine: 190.4},
                {month: 10, temperature: 23.4, precipitation: 179.5, sunshine: 127},
                {month: 11, temperature: 17.2, precipitation: 43, sunshine: 195.8},
                {month: 12, temperature: 12.4, precipitation: 76, sunshine: 170.8}
            ], 
            [
                {month: 1, temperature: 7.4, precipitation: 9.5, sunshine: 189.8},
                {month: 2, temperature: 11.8, precipitation: 114, sunshine: 167},
                {month: 3, temperature: 13, precipitation: 43, sunshine: 229.5},
                {month: 4, temperature: 19.5, precipitation: 111.5, sunshine: 213.5},
                {month: 5, temperature: 23.8, precipitation: 330.5, sunshine: 169.8},
                {month: 6, temperature: 28, precipitation: 171, sunshine: 135.3},
                {month: 7, temperature: 32.2, precipitation: 262, sunshine: 168.4},
                {month: 8, temperature: 32.7, precipitation: 116, sunshine: 168.7},
                {month: 9, temperature: 29.5, precipitation: 388.5, sunshine: 186.7},
                {month: 10, temperature: 23.7, precipitation: 133, sunshine: 191.7},
                {month: 11, temperature: 18.2, precipitation: 82.5, sunshine: 155.3},
                {month: 12, temperature: 11.1, precipitation: 24, sunshine: 175.8}
            ], 
            [
                {month: 1, temperature: 8.5, precipitation: 35, sunshine: 162},
                {month: 2, temperature: 8.5, precipitation: 109.5, sunshine: 150.9},
                {month: 3, temperature: 13.2, precipitation: 147.5, sunshine: 175.1},
                {month: 4, temperature: 19.7, precipitation: 144, sunshine: 177.6},
                {month: 5, temperature: 24.6, precipitation: 55.5, sunshine: 219.5},
                {month: 6, temperature: 26.6, precipitation: 200, sunshine: 120.9},
                {month: 7, temperature: 31.2, precipitation: 224, sunshine: 183.3},
                {month: 8, temperature: 33.4, precipitation: 142.5, sunshine: 236.3},
                {month: 9, temperature: 30.8, precipitation: 233.5, sunshine: 183.2},
                {month: 10, temperature: 24.1, precipitation: 102.5, sunshine: 221.2},
                {month: 11, temperature: 16, precipitation: 78, sunshine: 159.9},
                {month: 12, temperature: 9.5, precipitation: 95.5, sunshine: 169.6}
            ], 
            [
                {month: 1, temperature: 9, precipitation: 51.5, sunshine: 209.7},
                {month: 2, temperature: 9.1, precipitation: 68.5, sunshine: 156},
                {month: 3, temperature: 16.5, precipitation: 54, sunshine: 207.1},
                {month: 4, temperature: 19.6, precipitation: 130.5, sunshine: 214.1},
                {month: 5, temperature: 25.5, precipitation: 63.5, sunshine: 282.2},
                {month: 6, temperature: 28.4, precipitation: 148.5, sunshine: 129.1},
                {month: 7, temperature: 33, precipitation: 186.5, sunshine: 203.3},
                {month: 8, temperature: 34.5, precipitation: 136, sunshine: 262.3},
                {month: 9, temperature: 29.9, precipitation: 280, sunshine: 204.3},
                {month: 10, temperature: 24.5, precipitation: 236, sunshine: 146.7},
                {month: 11, temperature: 16.1, precipitation: 51, sunshine: 167.1},
                {month: 12, temperature: 10.9, precipitation: 57.5, sunshine: 173.4}
            ], 
            [
                {month: 1, temperature: 9.6, precipitation: 38.5, sunshine: 214.1},
                {month: 2, temperature: 10.5, precipitation: 132.5, sunshine: 189.2},
                {month: 3, temperature: 14.4, precipitation: 153, sunshine: 215.1},
                {month: 4, temperature: 20.4, precipitation: 128, sunshine: 220.3},
                {month: 5, temperature: 25.6, precipitation: 154.5, sunshine: 273.7},
                {month: 6, temperature: 29, precipitation: 72, sunshine: 181},
                {month: 7, temperature: 32.3, precipitation: 106, sunshine: 194.9},
                {month: 8, temperature: 31.5, precipitation: 179, sunshine: 102.3},
                {month: 9, temperature: 28.4, precipitation: 195, sunshine: 186.5},
                {month: 10, temperature: 23.4, precipitation: 167.5, sunshine: 161},
                {month: 11, temperature: 17.7, precipitation: 96.5, sunshine: 159.3},
                {month: 12, temperature: 9.2, precipitation: 83, sunshine: 157.9}
            ], 
            [
                {month: 1, temperature: 9.1, precipitation: 116, sunshine: 170},
                {month: 2, temperature: 10.2, precipitation: 35, sunshine: 174.7},
                {month: 3, temperature: 15.3, precipitation: 139, sunshine: 197.7},
                {month: 4, temperature: 20, precipitation: 148.5, sunshine: 145.1},
                {month: 5, temperature: 27.1, precipitation: 98, sunshine: 251.3},
                {month: 6, temperature: 26.8, precipitation: 196, sunshine: 127.7},
                {month: 7, temperature: 30.5, precipitation: 227.5, sunshine: 144.7},
                {month: 8, temperature: 32.9, precipitation: 296.5, sunshine: 181},
                {month: 9, temperature: 27.5, precipitation: 262, sunshine: 159.5},
                {month: 10, temperature: 23.8, precipitation: 64.5, sunshine: 240.6},
                {month: 11, temperature: 18.6, precipitation: 137, sunshine: 136.4},
                {month: 12, temperature: 13.9, precipitation: 83, sunshine: 171.6}
            ], 
            [
                {month: 1, temperature: 10.3, precipitation: 55, sunshine: 186.1},
                {month: 2, temperature: 11.7, precipitation: 64.5, sunshine: 184.2},
                {month: 3, temperature: 16.4, precipitation: 111, sunshine: 232.7},
                {month: 4, temperature: 21.1, precipitation: 200, sunshine: 175.5},
                {month: 5, temperature: 25.9, precipitation: 145, sunshine: 213.7},
                {month: 6, temperature: 27.5, precipitation: 218.5, sunshine: 154.3},
                {month: 7, temperature: 31.6, precipitation: 170, sunshine: 183},
                {month: 8, temperature: 33.8, precipitation: 120, sunshine: 235.7},
                {month: 9, temperature: 29.3, precipitation: 298.5, sunshine: 101.5},
                {month: 10, temperature: 24.2, precipitation: 132.5, sunshine: 143.5},
                {month: 11, temperature: 17, precipitation: 78, sunshine: 168},
                {month: 12, temperature: 13, precipitation: 93, sunshine: 190}
            ], 
            [
                {month: 1, temperature: 9.6, precipitation: 24.5, sunshine: 187.4},
                {month: 2, temperature: 10.2, precipitation: 48, sunshine: 186.4},
                {month: 3, temperature: 13.9, precipitation: 74, sunshine: 216.7},
                {month: 4, temperature: 20.2, precipitation: 158, sunshine: 198},
                {month: 5, temperature: 26, precipitation: 64.5, sunshine: 224.5},
                {month: 6, temperature: 27.9, precipitation: 133, sunshine: 223.4},
                {month: 7, temperature: 32.7, precipitation: 265, sunshine: 172.9},
                {month: 8, temperature: 32.6, precipitation: 221.5, sunshine: 165.6},
                {month: 9, temperature: 28.4, precipitation: 107.5, sunshine: 174.1},
                {month: 10, temperature: 21.7, precipitation: 530, sunshine: 112.5},
                {month: 11, temperature: 16.2, precipitation: 47.5, sunshine: 180},
                {month: 12, temperature: 10.1, precipitation: 28, sunshine: 179.5}
            ], 
            [
                {month: 1, temperature: 8.5, precipitation: 41, sunshine: 194.3},
                {month: 2, temperature: 9.9, precipitation: 17.5, sunshine: 185.1},
                {month: 3, temperature: 17.4, precipitation: 202.5, sunshine: 232},
                {month: 4, temperature: 22.4, precipitation: 213.5, sunshine: 221},
                {month: 5, temperature: 24.8, precipitation: 253.5, sunshine: 211.2},
                {month: 6, temperature: 28.1, precipitation: 193.5, sunshine: 190},
                {month: 7, temperature: 34.4, precipitation: 152.5, sunshine: 241.7},
                {month: 8, temperature: 35.3, precipitation: 128, sunshine: 239.7},
                {month: 9, temperature: 27.7, precipitation: 365.5, sunshine: 103.8},
                {month: 10, temperature: 23.9, precipitation: 23.5, sunshine: 179.8},
                {month: 11, temperature: 18.7, precipitation: 44, sunshine: 183.5},
                {month: 12, temperature: 12.3, precipitation: 60.5, sunshine: 148.5}
            ], 
            [
                {month: 1, temperature: 9.7, precipitation: 14.5, sunshine: 190.5},
                {month: 2, temperature: 12, precipitation: 56.5, sunshine: 161.1},
                {month: 3, temperature: 15.4, precipitation: 80, sunshine: 196.1},
                {month: 4, temperature: 19.4, precipitation: 117.5, sunshine: 219.1},
                {month: 5, temperature: 26.2, precipitation: 146, sunshine: 267.7},
                {month: 6, temperature: 27.7, precipitation: 172, sunshine: 178.5},
                {month: 7, temperature: 29.7, precipitation: 283.5, sunshine: 102.1},
                {month: 8, temperature: 33.9, precipitation: 204, sunshine: 220.2},
                {month: 9, temperature: 31.6, precipitation: 39, sunshine: 177.2},
                {month: 10, temperature: 24.5, precipitation: 356.5, sunshine: 147},
                {month: 11, temperature: 18.3, precipitation: 18, sunshine: 205.1},
                {month: 12, temperature: 13, precipitation: 68, sunshine: 144.1}
            ]             
        ];
        // 大阪府
        this._osaka = [
            [
                {month: 1, temperature: 9.5, precipitation: 46, sunshine: 174.6},
                {month: 2, temperature: 11.8, precipitation: 132, sunshine: 135.4},
                {month: 3, temperature: 13.7, precipitation: 153.5, sunshine: 127},
                {month: 4, temperature: 18.1, precipitation: 143, sunshine: 163.8},
                {month: 5, temperature: 23.8, precipitation: 162, sunshine: 203.1},
                {month: 6, temperature: 28.2, precipitation: 222.5, sunshine: 166},
                {month: 7, temperature: 32, precipitation: 221.5, sunshine: 196.4},
                {month: 8, temperature: 35.2, precipitation: 37.5, sunshine: 253.4},
                {month: 9, temperature: 31.1, precipitation: 161, sunshine: 182.3},
                {month: 10, temperature: 23.9, precipitation: 172, sunshine: 133.1},
                {month: 11, temperature: 17.2, precipitation: 32.5, sunshine: 151.5},
                {month: 12, temperature: 12.6, precipitation: 84.5, sunshine: 145.3}
            ], 
            [
                {month: 1, temperature: 8.1, precipitation: 0.5, sunshine: 196},
                {month: 2, temperature: 11.9, precipitation: 113.5, sunshine: 140.4},
                {month: 3, temperature: 12.6, precipitation: 75.5, sunshine: 194},
                {month: 4, temperature: 19, precipitation: 92, sunshine: 220},
                {month: 5, temperature: 23.7, precipitation: 307.5, sunshine: 185.7},
                {month: 6, temperature: 28, precipitation: 200.5, sunshine: 142.5},
                {month: 7, temperature: 31.7, precipitation: 145, sunshine: 185.4},
                {month: 8, temperature: 33.4, precipitation: 189, sunshine: 237},
                {month: 9, temperature: 29.6, precipitation: 242, sunshine: 184.2},
                {month: 10, temperature: 23.9, precipitation: 146.5, sunshine: 179.6},
                {month: 11, temperature: 18.9, precipitation: 90, sunshine: 137.2},
                {month: 12, temperature: 11.8, precipitation: 12, sunshine: 160.6}
            ], 
            [
                {month: 1, temperature: 8.9, precipitation: 34, sunshine: 147.3},
                {month: 2, temperature: 8.4, precipitation: 96.5, sunshine: 135.2},
                {month: 3, temperature: 12.9, precipitation: 152, sunshine: 159},
                {month: 4, temperature: 20.4, precipitation: 92.5, sunshine: 191.1},
                {month: 5, temperature: 24.6, precipitation: 25, sunshine: 184.1},
                {month: 6, temperature: 27.4, precipitation: 291, sunshine: 121.8},
                {month: 7, temperature: 32, precipitation: 193.5, sunshine: 207},
                {month: 8, temperature: 34.3, precipitation: 141, sunshine: 242.8},
                {month: 9, temperature: 30.7, precipitation: 202, sunshine: 186.6},
                {month: 10, temperature: 23.9, precipitation: 79, sunshine: 204.3},
                {month: 11, temperature: 15.9, precipitation: 122.5, sunshine: 131.2},
                {month: 12, temperature: 10.1, precipitation: 90.5, sunshine: 147.8}
            ], 
            [
                {month: 1, temperature: 9, precipitation: 38.5, sunshine: 167.2},
                {month: 2, temperature: 9.3, precipitation: 92.5, sunshine: 140.7},
                {month: 3, temperature: 15.9, precipitation: 92, sunshine: 186.5},
                {month: 4, temperature: 19, precipitation: 108, sunshine: 223.3},
                {month: 5, temperature: 25.2, precipitation: 44, sunshine: 263.9},
                {month: 6, temperature: 28.9, precipitation: 266, sunshine: 154.4},
                {month: 7, temperature: 32.9, precipitation: 50, sunshine: 222.5},
                {month: 8, temperature: 34.8, precipitation: 128, sunshine: 255.9},
                {month: 9, temperature: 30, precipitation: 258.5, sunshine: 218.2},
                {month: 10, temperature: 24.6, precipitation: 210.5, sunshine: 148.1},
                {month: 11, temperature: 17, precipitation: 80.5, sunshine: 165.7},
                {month: 12, temperature: 11, precipitation: 49.5, sunshine: 153.1}
            ], 
            [
                {month: 1, temperature: 9.8, precipitation: 52, sunshine: 169.3},
                {month: 2, temperature: 9.8, precipitation: 55, sunshine: 125.2},
                {month: 3, temperature: 14, precipitation: 153, sunshine: 192},
                {month: 4, temperature: 20, precipitation: 72.5, sunshine: 217},
                {month: 5, temperature: 24.9, precipitation: 81, sunshine: 263.2},
                {month: 6, temperature: 28.5, precipitation: 74.5, sunshine: 166.4},
                {month: 7, temperature: 32.1, precipitation: 79, sunshine: 214.5},
                {month: 8, temperature: 31.7, precipitation: 341, sunshine: 147.4},
                {month: 9, temperature: 28.8, precipitation: 94.5, sunshine: 191.8},
                {month: 10, temperature: 24.1, precipitation: 122, sunshine: 168.3},
                {month: 11, temperature: 18.3, precipitation: 74.5, sunshine: 159.7},
                {month: 12, temperature: 10.1, precipitation: 79.5, sunshine: 146.5}
            ], 
            [
                {month: 1, temperature: 9.3, precipitation: 93, sunshine: 123.3},
                {month: 2, temperature: 10.6, precipitation: 25.5, sunshine: 136.8},
                {month: 3, temperature: 14.4, precipitation: 174.5, sunshine: 175.4},
                {month: 4, temperature: 20.3, precipitation: 107, sunshine: 152.1},
                {month: 5, temperature: 27, precipitation: 104, sunshine: 249.3},
                {month: 6, temperature: 27.1, precipitation: 196, sunshine: 144.1},
                {month: 7, temperature: 30.6, precipitation: 358, sunshine: 168.2},
                {month: 8, temperature: 33.2, precipitation: 185.5, sunshine: 202.3},
                {month: 9, temperature: 27.4, precipitation: 163, sunshine: 158.8},
                {month: 10, temperature: 24, precipitation: 40.5, sunshine: 231.2},
                {month: 11, temperature: 18.7, precipitation: 111.5, sunshine: 120.4},
                {month: 12, temperature: 13.8, precipitation: 90, sunshine: 144.3}
            ], 
            [
                {month: 1, temperature: 10.3, precipitation: 66.5, sunshine: 161.3},
                {month: 2, temperature: 11.5, precipitation: 81, sunshine: 170.4},
                {month: 3, temperature: 15.6, precipitation: 91, sunshine: 207},
                {month: 4, temperature: 21.3, precipitation: 127.5, sunshine: 168},
                {month: 5, temperature: 26.3, precipitation: 136.5, sunshine: 229.7},
                {month: 6, temperature: 27.6, precipitation: 325, sunshine: 148},
                {month: 7, temperature: 32.6, precipitation: 66, sunshine: 214.1},
                {month: 8, temperature: 35, precipitation: 161.5, sunshine: 262.6},
                {month: 9, temperature: 29.8, precipitation: 183.5, sunshine: 106.2},
                {month: 10, temperature: 24.8, precipitation: 42, sunshine: 148.3},
                {month: 11, temperature: 17.4, precipitation: 69, sunshine: 155.5},
                {month: 12, temperature: 13.1, precipitation: 104, sunshine: 155.9}
            ], 
            [
                {month: 1, temperature: 10, precipitation: 33.5, sunshine: 166.7},
                {month: 2, temperature: 10.2, precipitation: 45, sunshine: 144.3},
                {month: 3, temperature: 13.7, precipitation: 46.5, sunshine: 186.8},
                {month: 4, temperature: 20, precipitation: 94, sunshine: 199},
                {month: 5, temperature: 26, precipitation: 96, sunshine: 245.8},
                {month: 6, temperature: 27.5, precipitation: 167.5, sunshine: 216},
                {month: 7, temperature: 33.1, precipitation: 45.5, sunshine: 193.7},
                {month: 8, temperature: 33.8, precipitation: 104.5, sunshine: 214.8},
                {month: 9, temperature: 28.4, precipitation: 127.5, sunshine: 158.4},
                {month: 10, temperature: 21.6, precipitation: 430, sunshine: 105},
                {month: 11, temperature: 16.6, precipitation: 58, sunshine: 178.9},
                {month: 12, temperature: 10.7, precipitation: 27.5, sunshine: 175.2}
            ], 
            [
                {month: 1, temperature: 8.4, precipitation: 51.5, sunshine: 172.7},
                {month: 2, temperature: 9.2, precipitation: 28.5, sunshine: 186.1},
                {month: 3, temperature: 16.6, precipitation: 137, sunshine: 223.7},
                {month: 4, temperature: 21.6, precipitation: 140, sunshine: 218.4},
                {month: 5, temperature: 24.6, precipitation: 230.5, sunshine: 203.7},
                {month: 6, temperature: 27.9, precipitation: 192, sunshine: 179.3},
                {month: 7, temperature: 34.2, precipitation: 332, sunshine: 235.4},
                {month: 8, temperature: 34.6, precipitation: 41.5, sunshine: 260.7},
                {month: 9, temperature: 27.6, precipitation: 372, sunshine: 91.7},
                {month: 10, temperature: 23.9, precipitation: 24, sunshine: 198.7},
                {month: 11, temperature: 18.9, precipitation: 30.5, sunshine: 161.9},
                {month: 12, temperature: 13, precipitation: 72, sunshine: 133.3}
            ], 
            [
                {month: 1, temperature: 10.1, precipitation: 22.5, sunshine: 147.6},
                {month: 2, temperature: 11.4, precipitation: 42.5, sunshine: 123.7},
                {month: 3, temperature: 14.8, precipitation: 75, sunshine: 161},
                {month: 4, temperature: 19.7, precipitation: 87, sunshine: 210.2},
                {month: 5, temperature: 26.4, precipitation: 88.5, sunshine: 268.6},
                {month: 6, temperature: 28.4, precipitation: 113.5, sunshine: 182.5},
                {month: 7, temperature: 30.5, precipitation: 202, sunshine: 127.6},
                {month: 8, temperature: 33.7, precipitation: 233.5, sunshine: 212.2},
                {month: 9, temperature: 31.2, precipitation: 81, sunshine: 198.9},
                {month: 10, temperature: 24.8, precipitation: 214, sunshine: 135.8},
                {month: 11, temperature: 18.6, precipitation: 2, sunshine: 193.8},
                {month: 12, temperature: 13.2, precipitation: 57.5, sunshine: 139.3}
            ]                 
        ];
        // 福岡
        this._fukuoka = [
            [
                {month: 1, temperature: 10.3, precipitation: 50.5, sunshine: 133.4},
                {month: 2, temperature: 13.1, precipitation: 70, sunshine: 114.1},
                {month: 3, temperature: 14.3, precipitation: 155, sunshine: 111.2},
                {month: 4, temperature: 18.1, precipitation: 199.5, sunshine: 154.3},
                {month: 5, temperature: 23.6, precipitation: 105, sunshine: 197.1},
                {month: 6, temperature: 27.6, precipitation: 203, sunshine: 145},
                {month: 7, temperature: 31.5, precipitation: 453.5, sunshine: 160.9},
                {month: 8, temperature: 35.2, precipitation: 69.5, sunshine: 229.7},
                {month: 9, temperature: 30.4, precipitation: 138.5, sunshine: 185},
                {month: 10, temperature: 23.6, precipitation: 78.5, sunshine: 126.8},
                {month: 11, temperature: 17.4, precipitation: 58, sunshine: 169.2},
                {month: 12, temperature: 12.3, precipitation: 148, sunshine: 106.4}
            ], 
            [
                {month: 1, temperature: 6.5, precipitation: 106, sunshine: 89.7},
                {month: 2, temperature: 12.7, precipitation: 48, sunshine: 130.8},
                {month: 3, temperature: 13, precipitation: 60, sunshine: 185},
                {month: 4, temperature: 19.6, precipitation: 37.5, sunshine: 224.5},
                {month: 5, temperature: 23.9, precipitation: 277.5, sunshine: 156.3},
                {month: 6, temperature: 27.6, precipitation: 409, sunshine: 107.6},
                {month: 7, temperature: 31.9, precipitation: 172, sunshine: 201.3},
                {month: 8, temperature: 33.1, precipitation: 322, sunshine: 177.4},
                {month: 9, temperature: 29.3, precipitation: 85.5, sunshine: 177.4},
                {month: 10, temperature: 23.5, precipitation: 127, sunshine: 157.6},
                {month: 11, temperature: 20.3, precipitation: 166.5, sunshine: 115.7},
                {month: 12, temperature: 11.6, precipitation: 38, sunshine: 96.6}
            ], 
            [
                {month: 1, temperature: 9.4, precipitation: 29.5, sunshine: 98.7},
                {month: 2, temperature: 8.9, precipitation: 155, sunshine: 75.6},
                {month: 3, temperature: 14.4, precipitation: 125, sunshine: 153.8},
                {month: 4, temperature: 21, precipitation: 74.5, sunshine: 211.1},
                {month: 5, temperature: 24.6, precipitation: 43.5, sunshine: 184.5},
                {month: 6, temperature: 26.9, precipitation: 288.5, sunshine: 105.8},
                {month: 7, temperature: 31.9, precipitation: 464, sunshine: 175.2},
                {month: 8, temperature: 33.6, precipitation: 188.5, sunshine: 196.7},
                {month: 9, temperature: 28.4, precipitation: 129, sunshine: 159.4},
                {month: 10, temperature: 23.8, precipitation: 47.5, sunshine: 204.3},
                {month: 11, temperature: 16.5, precipitation: 125, sunshine: 135.5},
                {month: 12, temperature: 11, precipitation: 98.5, sunshine: 98.4}
            ], 
            [
                {month: 1, temperature: 9.8, precipitation: 57.5, sunshine: 125.6},
                {month: 2, temperature: 11.6, precipitation: 81.5, sunshine: 136.9},
                {month: 3, temperature: 17.4, precipitation: 56.5, sunshine: 178.6},
                {month: 4, temperature: 19.2, precipitation: 108, sunshine: 209.1},
                {month: 5, temperature: 25.3, precipitation: 37, sunshine: 250.6},
                {month: 6, temperature: 27.1, precipitation: 268.5, sunshine: 97.6},
                {month: 7, temperature: 34, precipitation: 134, sunshine: 215.8},
                {month: 8, temperature: 34.5, precipitation: 501.5, sunshine: 246.2},
                {month: 9, temperature: 29.5, precipitation: 133, sunshine: 209},
                {month: 10, temperature: 24.7, precipitation: 227.5, sunshine: 172.2},
                {month: 11, temperature: 17.1, precipitation: 119.5, sunshine: 112.1},
                {month: 12, temperature: 11.4, precipitation: 77, sunshine: 104.8}
            ], 
            [
                {month: 1, temperature: 11.7, precipitation: 57.5, sunshine: 146.3},
                {month: 2, temperature: 11.3, precipitation: 83, sunshine: 105.2},
                {month: 3, temperature: 16.1, precipitation: 102.5, sunshine: 175.1},
                {month: 4, temperature: 20.6, precipitation: 61, sunshine: 179.9},
                {month: 5, temperature: 25.8, precipitation: 94, sunshine: 280.7},
                {month: 6, temperature: 26.6, precipitation: 101, sunshine: 107.9},
                {month: 7, temperature: 30.9, precipitation: 373, sunshine: 148},
                {month: 8, temperature: 29.7, precipitation: 462.5, sunshine: 79.7},
                {month: 9, temperature: 28.2, precipitation: 107, sunshine: 159.5},
                {month: 10, temperature: 24, precipitation: 144.5, sunshine: 183.6},
                {month: 11, temperature: 18.9, precipitation: 106, sunshine: 138},
                {month: 12, temperature: 10.9, precipitation: 73.5, sunshine: 105.9}
            ], 
            [
                {month: 1, temperature: 11.1, precipitation: 83.5, sunshine: 112.2},
                {month: 2, temperature: 11.2, precipitation: 42.5, sunshine: 114.3},
                {month: 3, temperature: 15.4, precipitation: 94.5, sunshine: 193.7},
                {month: 4, temperature: 21, precipitation: 239.5, sunshine: 161.9},
                {month: 5, temperature: 25.3, precipitation: 120.5, sunshine: 230.5},
                {month: 6, temperature: 26.3, precipitation: 222.5, sunshine: 124.6},
                {month: 7, temperature: 29.8, precipitation: 266, sunshine: 149.2},
                {month: 8, temperature: 31.4, precipitation: 319.5, sunshine: 203.5},
                {month: 9, temperature: 27.3, precipitation: 146, sunshine: 158.1},
                {month: 10, temperature: 23.5, precipitation: 83, sunshine: 231.2},
                {month: 11, temperature: 19.6, precipitation: 140.5, sunshine: 101.8},
                {month: 12, temperature: 13.5, precipitation: 109.5, sunshine: 91}
            ], 
            [
                {month: 1, temperature: 9.9, precipitation: 92, sunshine: 59.3},
                {month: 2, temperature: 12, precipitation: 98.5, sunshine: 106.6},
                {month: 3, temperature: 16.1, precipitation: 77.5, sunshine: 160.4},
                {month: 4, temperature: 21.3, precipitation: 196, sunshine: 160.2},
                {month: 5, temperature: 25.6, precipitation: 191.5, sunshine: 224.9},
                {month: 6, temperature: 27.4, precipitation: 394.5, sunshine: 137.7},
                {month: 7, temperature: 32.7, precipitation: 179.5, sunshine: 230},
                {month: 8, temperature: 34.3, precipitation: 128, sunshine: 285},
                {month: 9, temperature: 28.4, precipitation: 608.5, sunshine: 102.8},
                {month: 10, temperature: 25.1, precipitation: 181, sunshine: 113},
                {month: 11, temperature: 18.3, precipitation: 132.5, sunshine: 126.5},
                {month: 12, temperature: 14.4, precipitation: 141, sunshine: 125.1}
            ], 
            [
                {month: 1, temperature: 11.5, precipitation: 69.5, sunshine: 139.5},
                {month: 2, temperature: 12.5, precipitation: 49.5, sunshine: 152.7},
                {month: 3, temperature: 14.7, precipitation: 46, sunshine: 169.2},
                {month: 4, temperature: 21.1, precipitation: 192.5, sunshine: 198},
                {month: 5, temperature: 25.8, precipitation: 81, sunshine: 253.9},
                {month: 6, temperature: 27.7, precipitation: 173, sunshine: 194.3},
                {month: 7, temperature: 33.3, precipitation: 146, sunshine: 207.5},
                {month: 8, temperature: 33.8, precipitation: 95.5, sunshine: 258.2},
                {month: 9, temperature: 28, precipitation: 128.5, sunshine: 136.6},
                {month: 10, temperature: 23.1, precipitation: 289.5, sunshine: 122.8},
                {month: 11, temperature: 17.6, precipitation: 23.5, sunshine: 145.4},
                {month: 12, temperature: 10.6, precipitation: 24, sunshine: 91}
            ], 
            [
                {month: 1, temperature: 9, precipitation: 89.5, sunshine: 95.9},
                {month: 2, temperature: 10.1, precipitation: 57, sunshine: 130.2},
                {month: 3, temperature: 16.9, precipitation: 147.5, sunshine: 202.4},
                {month: 4, temperature: 21.9, precipitation: 61, sunshine: 216.6},
                {month: 5, temperature: 25.3, precipitation: 134, sunshine: 190.6},
                {month: 6, temperature: 27.6, precipitation: 267, sunshine: 178.9},
                {month: 7, temperature: 32.6, precipitation: 466.5, sunshine: 250.3},
                {month: 8, temperature: 34.5, precipitation: 52, sunshine: 282.9},
                {month: 9, temperature: 28.5, precipitation: 176.5, sunshine: 118},
                {month: 10, temperature: 22.9, precipitation: 59.5, sunshine: 172.2},
                {month: 11, temperature: 19, precipitation: 39.5, sunshine: 165.7},
                {month: 12, temperature: 13.1, precipitation: 67, sunshine: 91.1}
            ], 
            [
                {month: 1, temperature: 11.7, precipitation: 54.5, sunshine: 140},
                {month: 2, temperature: 13.3, precipitation: 41.5, sunshine: 124.6},
                {month: 3, temperature: 16.1, precipitation: 99.5, sunshine: 186.6},
                {month: 4, temperature: 19.8, precipitation: 103, sunshine: 191.8},
                {month: 5, temperature: 26.4, precipitation: 42, sunshine: 262.3},
                {month: 6, temperature: 27.8, precipitation: 94, sunshine: 199.9},
                {month: 7, temperature: 29.9, precipitation: 295.5, sunshine: 133.4},
                {month: 8, temperature: 31.9, precipitation: 497, sunshine: 152.2},
                {month: 9, temperature: 29.9, precipitation: 136, sunshine: 165.3},
                {month: 10, temperature: 24.4, precipitation: 136.5, sunshine: 165.8},
                {month: 11, temperature: 19.4, precipitation: 29, sunshine: 169.1},
                {month: 12, temperature: 14.1, precipitation: 80, sunshine: 91}
            ]   
        ];
        // 那覇(沖縄県)
        this._naha = [
            [
                {month: 1, temperature: 16.8, precipitation: 90, sunshine: 92.7},
                {month: 2, temperature: 18.3, precipitation: 276.5, sunshine: 69.5},
                {month: 3, temperature: 19.9, precipitation: 41.5, sunshine: 134.9},
                {month: 4, temperature: 21.2, precipitation: 219, sunshine: 81.3},
                {month: 5, temperature: 23.8, precipitation: 574.5, sunshine: 111.8},
                {month: 6, temperature: 26.7, precipitation: 220.5, sunshine: 128.1},
                {month: 7, temperature: 28.7, precipitation: 348.5, sunshine: 146.2},
                {month: 8, temperature: 28.9, precipitation: 281.5, sunshine: 183.5},
                {month: 9, temperature: 28, precipitation: 193, sunshine: 207.2},
                {month: 10, temperature: 25.7, precipitation: 368, sunshine: 119.7},
                {month: 11, temperature: 21.4, precipitation: 194, sunshine: 105.1},
                {month: 12, temperature: 18.1, precipitation: 88.5, sunshine: 122.7}
            ], 
            [
                {month: 1, temperature: 14.9, precipitation: 97, sunshine: 59.7},
                {month: 2, temperature: 17.6, precipitation: 121.5, sunshine: 104.4},
                {month: 3, temperature: 17.1, precipitation: 40, sunshine: 88},
                {month: 4, temperature: 20.4, precipitation: 90, sunshine: 182.4},
                {month: 5, temperature: 23.9, precipitation: 299.5, sunshine: 75.7},
                {month: 6, temperature: 27.9, precipitation: 223.5, sunshine: 189.5},
                {month: 7, temperature: 28.9, precipitation: 111, sunshine: 234.9},
                {month: 8, temperature: 28.3, precipitation: 471.5, sunshine: 199.2},
                {month: 9, temperature: 27.9, precipitation: 71.5, sunshine: 205.2},
                {month: 10, temperature: 25.2, precipitation: 212, sunshine: 114.7},
                {month: 11, temperature: 23.7, precipitation: 314, sunshine: 78.8},
                {month: 12, temperature: 18.6, precipitation: 70.5, sunshine: 69.8}
            ], 
            [
                {month: 1, temperature: 17, precipitation: 119, sunshine: 54.4},
                {month: 2, temperature: 17.5, precipitation: 109.5, sunshine: 57.3},
                {month: 3, temperature: 19.6, precipitation: 81, sunshine: 124.8},
                {month: 4, temperature: 21.7, precipitation: 356.5, sunshine: 99.6},
                {month: 5, temperature: 24.4, precipitation: 229.5, sunshine: 141.6},
                {month: 6, temperature: 26.9, precipitation: 372, sunshine: 124.7},
                {month: 7, temperature: 29.1, precipitation: 96, sunshine: 239.5},
                {month: 8, temperature: 28.5, precipitation: 674, sunshine: 164.1},
                {month: 9, temperature: 27.2, precipitation: 271.5, sunshine: 159.1},
                {month: 10, temperature: 24.6, precipitation: 96.5, sunshine: 163.2},
                {month: 11, temperature: 21, precipitation: 214.5, sunshine: 115.7},
                {month: 12, temperature: 18.5, precipitation: 113, sunshine: 94.9}
            ], 
            [
                {month: 1, temperature: 17, precipitation: 100, sunshine: 94.6},
                {month: 2, temperature: 18.6, precipitation: 75, sunshine: 111.7},
                {month: 3, temperature: 20.4, precipitation: 140.5, sunshine: 143.5},
                {month: 4, temperature: 20.6, precipitation: 202.5, sunshine: 93.4},
                {month: 5, temperature: 23.7, precipitation: 602.5, sunshine: 94.1},
                {month: 6, temperature: 27.9, precipitation: 105, sunshine: 216},
                {month: 7, temperature: 29.4, precipitation: 4.5, sunshine: 268.4},
                {month: 8, temperature: 29.6, precipitation: 212, sunshine: 241.7},
                {month: 9, temperature: 28.3, precipitation: 178, sunshine: 206.5},
                {month: 10, temperature: 25.3, precipitation: 200, sunshine: 129.7},
                {month: 11, temperature: 21.3, precipitation: 121, sunshine: 120},
                {month: 12, temperature: 17.3, precipitation: 130, sunshine: 89.4}
            ], 
            [
                {month: 1, temperature: 16.8, precipitation: 66, sunshine: 145.4},
                {month: 2, temperature: 17.9, precipitation: 227, sunshine: 82.9},
                {month: 3, temperature: 18.4, precipitation: 185, sunshine: 110.1},
                {month: 4, temperature: 20.9, precipitation: 100.5, sunshine: 149.1},
                {month: 5, temperature: 23.6, precipitation: 354.5, sunshine: 112.5},
                {month: 6, temperature: 26.9, precipitation: 397.5, sunshine: 134.5},
                {month: 7, temperature: 29.3, precipitation: 494, sunshine: 235.5},
                {month: 8, temperature: 28.7, precipitation: 229, sunshine: 175.7},
                {month: 9, temperature: 28.8, precipitation: 95.5, sunshine: 224},
                {month: 10, temperature: 25.4, precipitation: 269, sunshine: 171.2},
                {month: 11, temperature: 22.6, precipitation: 49.5, sunshine: 134.7},
                {month: 12, temperature: 17.6, precipitation: 117, sunshine: 84.6}
            ], 
            [
                {month: 1, temperature: 16.6, precipitation: 22, sunshine: 90.7},
                {month: 2, temperature: 16.8, precipitation: 47, sunshine: 114.1},
                {month: 3, temperature: 19, precipitation: 95.5, sunshine: 126.5},
                {month: 4, temperature: 22.2, precipitation: 100, sunshine: 118.9},
                {month: 5, temperature: 24.9, precipitation: 197.5, sunshine: 144.2},
                {month: 6, temperature: 28.7, precipitation: 38, sunshine: 221.7},
                {month: 7, temperature: 29, precipitation: 369, sunshine: 202.3},
                {month: 8, temperature: 28.7, precipitation: 278, sunshine: 170.2},
                {month: 9, temperature: 27.8, precipitation: 46.5, sunshine: 208.5},
                {month: 10, temperature: 25.5, precipitation: 63.5, sunshine: 174.6},
                {month: 11, temperature: 23.8, precipitation: 95, sunshine: 139.7},
                {month: 12, temperature: 20.1, precipitation: 73, sunshine: 102.4}
            ], 
            [
                {month: 1, temperature: 17.4, precipitation: 272.5, sunshine: 75.8},
                {month: 2, temperature: 16.9, precipitation: 157.5, sunshine: 83.1},
                {month: 3, temperature: 18.7, precipitation: 168.5, sunshine: 106.6},
                {month: 4, temperature: 23, precipitation: 350.5, sunshine: 125.5},
                {month: 5, temperature: 25.7, precipitation: 129.5, sunshine: 143.2},
                {month: 6, temperature: 28.4, precipitation: 319.5, sunshine: 185.7},
                {month: 7, temperature: 29.8, precipitation: 193, sunshine: 253},
                {month: 8, temperature: 29.5, precipitation: 209, sunshine: 226.4},
                {month: 9, temperature: 28.4, precipitation: 342, sunshine: 141.8},
                {month: 10, temperature: 27.7, precipitation: 75.5, sunshine: 175.6},
                {month: 11, temperature: 23.2, precipitation: 103, sunshine: 128.4},
                {month: 12, temperature: 20.5, precipitation: 47.5, sunshine: 112.1}
            ], 
            [
                {month: 1, temperature: 18.4, precipitation: 92.5, sunshine: 77},
                {month: 2, temperature: 17.1, precipitation: 84, sunshine: 79.9},
                {month: 3, temperature: 18.3, precipitation: 96.5, sunshine: 102.4},
                {month: 4, temperature: 21.6, precipitation: 67, sunshine: 128.6},
                {month: 5, temperature: 24.2, precipitation: 315.5, sunshine: 112.1},
                {month: 6, temperature: 26.6, precipitation: 444.5, sunshine: 107.7},
                {month: 7, temperature: 29.9, precipitation: 44, sunshine: 267.2},
                {month: 8, temperature: 30.4, precipitation: 56.5, sunshine: 242.1},
                {month: 9, temperature: 28.9, precipitation: 239.5, sunshine: 186.1},
                {month: 10, temperature: 27, precipitation: 270, sunshine: 155.8},
                {month: 11, temperature: 22.8, precipitation: 146.5, sunshine: 85.6},
                {month: 12, temperature: 18, precipitation: 50.5, sunshine: 101.5}
            ], 
            [
                {month: 1, temperature: 17.2, precipitation: 150.5, sunshine: 74.9},
                {month: 2, temperature: 16.9, precipitation: 84, sunshine: 97.9},
                {month: 3, temperature: 19.9, precipitation: 100.5, sunshine: 181.6},
                {month: 4, temperature: 21.6, precipitation: 126, sunshine: 161.3},
                {month: 5, temperature: 25.6, precipitation: 33, sunshine: 238.4},
                {month: 6, temperature: 27.8, precipitation: 218.5, sunshine: 171.7},
                {month: 7, temperature: 28.3, precipitation: 429, sunshine: 179.7},
                {month: 8, temperature: 28.5, precipitation: 310, sunshine: 203.4},
                {month: 9, temperature: 28.4, precipitation: 334.5, sunshine: 174.6},
                {month: 10, temperature: 23.9, precipitation: 375, sunshine: 151.8},
                {month: 11, temperature: 23.1, precipitation: 160.5, sunshine: 155.9},
                {month: 12, temperature: 20.4, precipitation: 148, sunshine: 85.3}
            ], 
            [
                {month: 1, temperature: 18.1, precipitation: 55, sunshine: 97.4},
                {month: 2, temperature: 20, precipitation: 156.5, sunshine: 78.4},
                {month: 3, temperature: 19.9, precipitation: 183.5, sunshine: 129.8},
                {month: 4, temperature: 22.3, precipitation: 128, sunshine: 119.2},
                {month: 5, temperature: 24.2, precipitation: 208.5, sunshine: 150.7},
                {month: 6, temperature: 26.5, precipitation: 595.5, sunshine: 90.7},
                {month: 7, temperature: 28.9, precipitation: 284, sunshine: 196.2},
                {month: 8, temperature: 29.2, precipitation: 208, sunshine: 191.3},
                {month: 9, temperature: 28, precipitation: 477.5, sunshine: 154.2},
                {month: 10, temperature: 26, precipitation: 104.5, sunshine: 198.8},
                {month: 11, temperature: 23.1, precipitation: 136, sunshine: 135.7},
                {month: 12, temperature: 20, precipitation: 100.5, sunshine: 123.2}
            ]                
        ];
    }

    _getDetailedData(data, year, month, param) {
        console.log(year);
        // yearの一文字目を消し、数値型へ変換
        const y = Number(year.slice(1));
        // 確認
        console.log(year.slice(1));
        console.log(y);

        // yの値を確認し、適した年のデータを取得
        for(var i = 2010; i < 2020; i++) {
            if(i === y) {
                if(param === 'temperature') {
                    return data[i-2010][month-1]['temperature'];
                }
                else if(param === 'precipitation') {
                    return data[i-2010][month-1]['precipitation'];
                }
                else if(param === 'sunshine') {
                    return data[i-2010][month-1]['sunshine'];
                }
            }
        }
        return null;
    }

    _getData(area, year, month, param) {
        var test = 0;
        console.log(year);
        if(area === AreaParam.SAPPORO) {
            test = this._getDetailedData(this._sapporo, year, month, param);
        }
        else if(area === AreaParam.SENDAI) {
            test = this._getDetailedData(this._sendai, year, month, param);
        }
        else if(area === AreaParam.TOKYO) {
            test = this._getDetailedData(this._tokyo, year, month, param);
        }
        else if(area === AreaParam.SUWA) {
            test = this._getDetailedData(this._suwa, year, month, param);
        }
        else if(area === AreaParam.NAGOYA) {
            test = this._getDetailedData(this._nagoya, year, month, param);
        }
        else if(area === AreaParam.OSAKA) {
            test = this._getDetailedData(this._osaka, year, month, param);
        }
        else if(area === AreaParam.FUKUOKA) {
            test = this._getDetailedData(this._fukuoka, year, month, param);
        }
        else if(area === AreaParam.NAHA) {
            test = this._getDetailedData(this._naha, year, month, param);
        }
        else {
            test = null;
        }
        return test;
    }

    _initYearDataParam() {
        return [
            {text: formatMessage({id: 'wether.YearDataMenu.y50', default: '2010年', description: '2010年'}), value: YearDataParam.Y2010}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y51', default: '2011年', description: '2011年'}), value: YearDataParam.Y2011}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y52', default: '2012年', description: '2012年'}), value: YearDataParam.Y2012}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y53', default: '2013年', description: '2013年'}), value: YearDataParam.Y2013}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y54', default: '2014年', description: '2014年'}), value: YearDataParam.Y2014}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y55', default: '2015年', description: '2015年'}), value: YearDataParam.Y2015}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y56', default: '2016年', description: '2016年'}), value: YearDataParam.Y2016}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y57', default: '2017年', description: '2017年'}), value: YearDataParam.Y2017}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y58', default: '2018年', description: '2018年'}), value: YearDataParam.Y2018}, 
            {text: formatMessage({id: 'wether.YearDataMenu.y59', default: '2019年', description: '2019年'}), value: YearDataParam.Y2019}
        ];
    }

    _initAreaParam() {
        return [
            {
                text: formatMessage({
                    id: 'wether.AreaMenu.sapporo',
                    default: 'さっぽろ(北海道)',
                    description: '札幌'
                }),
                value: AreaParam.SAPPORO
            },
            {
                text: formatMessage({
                    id: 'wether.AreaMenu.sendai',
                    default: 'せん台(宮城県)',
                    description: '仙台'
                }),
                value: AreaParam.SENDAI
            },
            {
                text: formatMessage({
                    id: 'wether.AreaMenu.tokyo',
                    default: '東京',
                    description: '東京'
                }),
                value: AreaParam.TOKYO
            },
            {
                text: formatMessage({
                    id: 'wether.AreaMenu.suwa',
                    default: 'す訪(長野県)',
                    description: '諏訪'
                }),
                value: AreaParam.SUWA
            },
            {
                text: formatMessage({
                    id: 'wether.AreaMenu.nagoya',
                    default: '名古屋(愛知県)',
                    description: '名古屋'
                }),
                value: AreaParam.NAGOYA
            },
            {
                text: formatMessage({
                    id: 'wether.AreaMenu.osaka',
                    default: '大阪',
                    description: '大阪'
                }),
                value: AreaParam.OSAKA
            },
            {
                text: formatMessage({
                    id: 'wether.AreaMenu.fukuoka',
                    default: '福岡',
                    description: '福岡'
                }),
                value: AreaParam.FUKUOKA
            },
            {
                text: formatMessage({
                    id: 'wether.AreaMenu.naha',
                    default: 'なは(沖縄県)',
                    description: '那覇'
                }),
                value: AreaParam.NAHA
            }
        ];
    }

    getInfo() {
        return {
            id: 'wether',
            name: '月平均気温・降水量・日照量',
            blocks: [
                {
                    opcode: 'getMonthLength',
                    blockType: BlockType.REPORTER,
                    text: '月の長さ'
                },
                {
                    opcode: 'getTempValue',
                    blockType: BlockType.REPORTER,
                    text: '[DATA_PARAM][VALUE]月[AREA]の平均気温',
                    arguments: {
                        DATA_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'yeardataParam',
                            defaultValue: YearDataParam.Y1949
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        AREA: {
                            type: ArgumentType.STRING,
                            menu: 'areaParam',
                            defaultValue: AreaParam.SUWA
                        }
                    }
                },
                {
                    opcode: 'getAllTempValue',
                    blockType: BlockType.REPORTER,
                    text: '[DATA_PARAM][AREA]の平均気温のデータ',
                    arguments: {
                        DATA_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'yeardataParam',
                            defaultValue: YearDataParam.Y1949
                        },
                        AREA: {
                            type: ArgumentType.STRING,
                            menu: 'areaParam',
                            defaultValue: AreaParam.SUWA
                        }
                    }
                },
                {
                    opcode: 'getPrecValue',
                    blockType: BlockType.REPORTER,
                    text: '[DATA_PARAM][VALUE]月[AREA]の降水量',
                    arguments: {
                        DATA_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'yeardataParam',
                            defaultValue: YearDataParam.Y1949
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        AREA: {
                            type: ArgumentType.STRING,
                            menu: 'areaParam',
                            defaultValue: AreaParam.SUWA
                        }
                    }
                },
                {
                    opcode: 'getAllPrecValue',
                    blockType: BlockType.REPORTER,
                    text: '[DATA_PARAM][AREA]の降水量のデータ',
                    arguments: {
                        DATA_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'yeardataParam',
                            defaultValue: YearDataParam.Y1949
                        },
                        AREA: {
                            type: ArgumentType.STRING,
                            menu: 'areaParam',
                            defaultValue: AreaParam.SUWA
                        }
                    }
                },
                {
                    opcode: 'getSunshine',
                    blockType: BlockType.REPORTER,
                    text: '[DATA_PARAM][VALUE]月[AREA]の日照量',
                    arguments: {
                        DATA_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'yeardataParam',
                            defaultValue: YearDataParam.Y1949
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        AREA: {
                            type: ArgumentType.STRING,
                            menu: 'areaParam',
                            defaultValue: AreaParam.SUWA
                        }
                    }
                },
                {
                    opcode: 'getAllSunshine',
                    blockType: BlockType.REPORTER,
                    text: '[DATA_PARAM][AREA]の日照量のデータ',
                    arguments: {
                        DATA_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'yeardataParam',
                            defaultValue: YearDataParam.Y1949
                        },
                        AREA: {
                            type: ArgumentType.STRING,
                            menu: 'areaParam',
                            defaultValue: AreaParam.SUWA
                        }
                    }
                }
            ],
            menus:{
                yeardataParam: {
                    acceptReporters: true,
                    items: this._initYearDataParam()
                },
                areaParam: {
                    acceptReporters: true,
                    items: this._initAreaParam()
                }
            }
        };
    }

    getMonthLength() {
        return 12;
    }

    getTempValue(args) {
        const area = Cast.toString(args.AREA);
        const value = Cast.toNumber(args.VALUE);
        const data_param = Cast.toString(args.DATA_PARAM);
        return this._getData(area, data_param, value, 'temperature');
    }

    getPrecValue(args) {
        const area = Cast.toString(args.AREA);
        const value = Cast.toNumber(args.VALUE);
        const data_param = Cast.toString(args.DATA_PARAM);
        return this._getData(area, data_param, value, 'precipitation');
    }

    getSunshine(args) {
        const area = Cast.toString(args.AREA);
        const value = Cast.toNumber(args.VALUE);
        const data_param = Cast.toString(args.DATA_PARAM);
        return this._getData(area, data_param, value, 'sunshine');
    }
}

module.exports = Scratch3WetherData;
