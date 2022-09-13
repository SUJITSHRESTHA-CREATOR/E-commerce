import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(value: any, filterString: string): any {
        if (value.length === 0 || filterString === '') {
            return value;
        }
        console.log(value);

        const resultArray = [];
        // for (const item of value) {
        //         if (
        //             item[propName].toLowerCase().split(' ').join('') ===
        //             filterString.toLowerCase().split(' ').join('')
        //         ) {
        //             resultArray.push(item);
        //         }
        // }

        // value.forEach((item, index, array) => {
        //     console.log(item);
        //     if (
        //         item[propName].toLowerCase().split(' ').join('') ===
        //         filterString.toLowerCase().split(' ').join('')
        //     ) {
        //         resultArray.push(item);
        //     }
        // });
        // (const item of value) {
        //     if (
        //         item[propName].toLowerCase().split(' ').join('') ===
        //         filterString.toLowerCase().split(' ').join('')
        //     ) {
        //         resultArray.push(item);
        //     }
        // }
        console.log(value.length);
        for (let i = 0; i < value.length; i++) {
            const inner = value[i];
            const inner1 = inner.keywords;
            // console.log(inner1, 'herijij');
            for (let j = 0; j < inner1.length; j++) {
                // console.log(inner1[j])
                if (
                    inner1[j].toLowerCase().split(' ').join('') ===
                    filterString.toLowerCase().split(' ').join('')
                ) {
                    const text = inner1[j];
                    // console.log(`The text is ${text}`);
                    resultArray.push(inner);
                }
            }
        }
        // console.log(resultArray, 'this is it');
        return resultArray;
    }
}

// const keywords = 'hellohi';
// const array = keywords.split(',');
// console.log(array);
// const arr = [
//     { name1: ['helloooo', 'meow'], test: 'yo yo' },
//     { name1: ['mu mu', 'pup'], test: 'wo wo' }
// ];
// for (let i = 0; i < arr.length; i++) {
//     const inner = arr[i];
//     const inner1 = inner.name1;
//     // console.log(inner1,'herijij')
//     for (let j = 0; j < inner1.length; j++) {
//         // console.log(inner1[j])
//         if (inner1[j] === 'helloooo') {
//             const text = inner1[j];
//             console.log(`The text is ${text}`);
//         }
//     }
// }

// *ngFor="let product of products | filter: filteredProd:'name'"
