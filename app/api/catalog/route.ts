import {json} from '../../../lib/submissions';import {products,settings,failure} from '../../../lib/cms';
export async function GET(){try{return json({items:await products(),settings:await settings()})}catch(e){return failure(e)}}
