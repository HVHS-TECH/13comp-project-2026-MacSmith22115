export default class Utils {
    static getNextElement(_array, _index){
        return _array[(_index + 1) % _array.length];
    }
}