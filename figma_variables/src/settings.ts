import {
    AssetChooserObjectType,
    AssetChooserProjectType,
    AssetInputMode,
    IconEnum,
    defineSettings,
} from '@frontify/guideline-blocks-settings';

export const settings = defineSettings({
    main: [
        {
            id: 'token_input',
            type: 'input',
            icon: IconEnum.Link,
            placeholder: 'Developer Token',
            inputType: 'password',
        },
        {
            id: 'figmaSourceFile',
            type: 'assetInput',
            size: 'large',
            objectTypes: [AssetChooserObjectType.Url], //Limit to only external assets (which is what Figma is)
            multiSelection: false,
            projectTypes: [AssetChooserProjectType.Workspace], //Limit to only projects
            mode: AssetInputMode.BrowseOnly,
        },
    ],
    layout: [
        {
            id: 'layout',
            type: 'dropdown',
            defaultValue: 'table',
            size: 'large',
            choices: [
                {
                    value: 'table',
                    label: 'Table',
                    icon: IconEnum.Table20,
                },
                {
                    value: 'palette',
                    label: 'Palette',
                    icon: IconEnum.ColorFan20,
                },
            ],
        },
    ],
});
