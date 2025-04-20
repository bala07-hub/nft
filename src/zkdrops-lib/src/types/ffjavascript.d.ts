declare module "ffjavascript" {
    export class F1Field {
      constructor(p: bigint);
      toObject(a: any): any;
      toString(a: any): string;
      isZero(a: any): boolean;
      eq(a: any, b: any): boolean;
      neg(a: any): any;
      add(a: any, b: any): any;
      sub(a: any, b: any): any;
      mul(a: any, b: any): any;
      div(a: any, b: any): any;
      square(a: any): any;
      sqrt(a: any): any | null;
      e(v: any): any;
      one: any;
      zero: any;
      lt(a: any, b: any): boolean;
    }
  }
  