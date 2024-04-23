import { TIME } from './Words/TIME';
import { HOME } from './Words/HOME';
import { PERSON } from './Words/PERSON';
import { YOU } from './Words/YOU';

const words: Record<string, (ref: any) => void > = {
    TIME, HOME, PERSON, YOU
};

export default words;
