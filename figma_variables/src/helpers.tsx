import { ApiGetLocalVariablesResponse, Color, Group, Variable, VariableCollection, VariableValue } from './figma_types';
import ColorBlock from './colorBlock';
import DisplayBlock from './displayBlock';
import ToggleBlock from './ToggleBlock';
import {
    IconArrowCircleUp16,
    IconColorFan16,
    IconLightbulb16,
    IconLinkBox16,
    IconListNumbers16,
    IconTextBoxStack16,
} from '@frontify/fondue';
import { Tag } from 'antd';
import { AndroidOutlined, AppleOutlined, GlobalOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

export function prepareCollectionsWithCategories(localVariablesResponse: ApiGetLocalVariablesResponse): {
    [collectionId: string]: VariableCollection;
} {
    const localVariableCollections = localVariablesResponse.meta.variableCollections;
    const localVariables = localVariablesResponse.meta.variables;

    // Resolve aliases in variables and update referenceAliases with modeId
    for (const variable of Object.values(localVariables)) {
        for (const modeId of Object.keys(variable.valuesByMode)) {
            const value = variable.valuesByMode[modeId];
            if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
                const sourceVariable = localVariables[value.id];
                value.source = sourceVariable;

                // Ensure the referenceAliases dictionary exists
                if (!sourceVariable.referenceAliases) {
                    sourceVariable.referenceAliases = {};
                }
                // Add the current variable and its mode to the source variable's referenceAliases dictionary
                sourceVariable.referenceAliases[modeId] = variable;
            }
        }
    }

    // Initialize collections with empty modes and groups
    for (const collection of Object.values(localVariableCollections)) {
        collection.groups = [];
    }

    for (const variable of Object.values(localVariables)) {
        // Skip remote variables because we only want to generate tokens for local variables
        if (variable.remote) {
            continue;
        }

        const collection = localVariableCollections[variable.variableCollectionId];

        let currentGroups = collection.groups;
        let lastGroup: Group | undefined = undefined;
        const groupNames = variable.name.split('/');

        for (const [index, groupName] of groupNames.entries()) {
            if (index < groupNames.length - 1) {
                // For non-last elements, find or create the group and prepare to go deeper
                const group = findOrCreateGroup(currentGroups, groupName);
                currentGroups = group.groups || [];
                lastGroup = group;
            } else {
                // For the last element, update the variable's actualName
                variable.actualName = groupName;
                variable.hidden = false;
                if (!lastGroup) {
                    const group = findOrCreateGroup(currentGroups, '');
                    lastGroup = group;
                }
                if (lastGroup) {
                    if (!lastGroup.variables) {
                        lastGroup.variables = [];
                    }
                    lastGroup.variables.push(variable);
                }
            }
        }
    }

    return localVariableCollections;
}

function findOrCreateGroup(groups: Group[], groupName: string): Group {
    let group = groups.find((g) => g.name === groupName);
    if (!group) {
        group = { name: groupName, variables: [], groups: [], hidden: false };
        groups.push(group);
    }
    return group;
}

const StringComponent = ({ text }: { text: string }) => <span>String: {text}</span>;

export const renderVariableComponent = (variable: Variable, modeId: string, table: boolean = false) => {
    const value = variable.valuesByMode[modeId];
    const resolvedType = variable.resolvedType;

    switch (resolvedType) {
        case 'STRING':
            return <StringComponent text={value as string} />;
        case 'BOOLEAN':
            return <ToggleBlock variable={variable} modeId={modeId} table={table} />;
        case 'FLOAT':
            if (table) {
                return value as string;
            } else {
                return <DisplayBlock variable={variable} modeId={modeId} />;
            }
        case 'COLOR':
            return <ColorBlock key={variable.id} variable={variable} table={table} modeId={modeId} />;
        default:
            return null; // Fallback for unhandled types
    }
};

export const renderVariableIcon = (variable: Variable) => {
    const resolvedType = variable.resolvedType;

    switch (resolvedType) {
        case 'STRING':
            return <IconTextBoxStack16 />;
        case 'BOOLEAN':
            return <IconLightbulb16 />;
        case 'FLOAT':
            return <IconListNumbers16 />;
        case 'COLOR':
            return <IconColorFan16 />;
        default:
            return null; // Fallback for unhandled types
    }
};

export const getCodeSyntax = (variable: Variable) => {
    const web = variable.codeSyntax.WEB;
    const android = variable.codeSyntax.ANDROID;
    const ios = variable.codeSyntax.iOS;

    return {
        web: web || null,
        android: android || null,
        ios: ios || null,
    };
};

export const codeSyntaxTags = (variable: Variable) => {
    const codeSyntax = getCodeSyntax(variable);
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {codeSyntax.web && <Tag icon={<GlobalOutlined />}>{codeSyntax.web}</Tag>}
            {codeSyntax.android && <Tag icon={<AndroidOutlined />}>{codeSyntax.android}</Tag>}
            {codeSyntax.ios && <Tag icon={<AppleOutlined />}>{codeSyntax.ios}</Tag>}
        </div>
    );
};

export const aliasNameTag = (variable: Variable) => {
    // Define a function to scroll to the color block
    const scrollToColorBlock = () => {
        const element = document.getElementById(variable.id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        variable.onHover?.(true);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.overflow = 'visible')}
            onMouseLeave={(e) => (e.currentTarget.style.overflow = 'hidden')}
        >
            <div style={{ display: 'block' }}>
                {/* Wrap the Tag component with a button that triggers the scroll function */}
                <button onClick={scrollToColorBlock}>
                    <Tag>{variable.name}</Tag>
                </button>
            </div>
        </div>
    );
};

export const listAllReferenceAliasesWithFlyout = (variable: Variable) => {
    const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
    const toggleFlyout = () => setIsFlyoutVisible(!isFlyoutVisible);

    const aliases = variable.referenceAliases;
    if (!aliases) {
        return null; // Return null if no aliases found
    }

    const content = Object.entries(aliases).map(([modeId, aliasVariable]) => (
        <div key={modeId}>
            <div>
                {modeId} {aliasVariable.name}
            </div>
            {aliasNameTag(aliasVariable)}
        </div>
    ));

    return (
        <div>
            <button onClick={toggleFlyout} style={{ border: 'none', background: 'none' }}>
                <IconLinkBox16 />
            </button>
            {isFlyoutVisible && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid gray',
                        padding: '10px',
                    }}
                >
                    {content}
                </div>
            )}
        </div>
    );
};
