import dict from './dict';
import error from './error';
import system from './system';
import menu from './menu';

export default (app) => {
    return [
        ...dict,
        ...error(app),
        ...system,
        ...menu,
    ]
};
