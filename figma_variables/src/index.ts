import { defineBlock } from '@frontify/guideline-blocks-settings';

import { FigmaVariables } from './Block';
import { settings } from './settings';

export default defineBlock({
    block: FigmaVariables,
    settings,
});
