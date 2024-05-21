import axios from 'axios';
//I'm unoriginal -> https://github.com/figma/variables-github-action-example/tree/5cec84f7ecc222892eeb9efb92b352e84aab1c20

export interface Group {
    name: string;
    variables?: Variable[];
    groups?: Group[];
    hidden: boolean;
}

//Variable Collections
export interface VariableCollection {
    id: string;
    name: string;
    modes: VariableMode[];
    defaultModeId: string;
    remote: boolean;
    hiddenFromPublishing: boolean;
    variableIds: string[];
    groups: Group[];
}

export interface VariableMode {
    modeId: string;
    name: string;
}

//Variables
export interface Variable {
    id: string;
    name: string;
    key: string;
    variableCollectionId: string;
    resolvedType: resolvedType;
    valuesByMode: { [modeId: string]: VariableValue };
    remote: boolean;
    description: string;
    hiddenFromPublishing: boolean;
    scopes: VariableScope[];
    codeSyntax: VariableCodeSyntax;
    actualName: string; //added to preprocess mapping actual names note: Not actually in scope of Figma API payload
    referenceAliases?: { [modeId: string]: Variable }; //added to preprocess mapping alias references to itself note: Not actually in scope of Figma API payload
    onHover?: (hoverState: boolean) => void;
    hidden: boolean; //added to customize display
}

export type resolvedType = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

export type VariableValue = boolean | number | string | Color | VariableAlias;

export interface Color {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export interface VariableAlias {
    type: 'VARIABLE_ALIAS';
    id: string;
    source: Variable; //added to preprocess mapping note: Not actually in scope of Figma API payload
}

export type VariableScope = 'ALL_SCOPES' | VariableFloatScopes | VariableColorScopes;
type VariableFloatScopes = 'TEXT_CONTENT' | 'WIDTH_HEIGHT' | 'GAP';
type VariableColorScopes = 'ALL_FILLS' | 'FRAME_FILL' | 'SHAPE_FILL' | 'TEXT_FILL' | 'STROKE_COLOR';

export type VariableCodeSyntax = { WEB?: string; ANDROID?: string; iOS?: string };

//Figma API
export interface ApiGetLocalVariablesResponse {
    status: number;
    error: boolean;
    meta: {
        variableCollections: { [id: string]: VariableCollection };
        variables: { [id: string]: Variable };
    };
}

export class FigmaApi {
    private baseUrl = 'https://api.figma.com';
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    async getLocalVariables(fileKey: string) {
        const resp = await axios.request<ApiGetLocalVariablesResponse>({
            url: `${this.baseUrl}/v1/files/${fileKey}/variables/local`,
            headers: {
                Accept: '*/*',
                'X-Figma-Token': this.token,
            },
        });

        return resp.data;
    }
}
