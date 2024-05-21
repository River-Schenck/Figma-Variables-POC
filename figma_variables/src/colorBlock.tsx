import React, { FC, useRef, useState } from 'react';
import { Color, Variable } from './figma_types';
import { aliasNameTag, codeSyntaxTags } from './helpers';
import { isVariableAlias } from './resolveTypes';
import { IconLink16 } from '@frontify/fondue';

type ColorBlockProps = {
    variable: Variable;
    modeId: string;
    table?: boolean;
};

const ColorBlock: FC<ColorBlockProps> = ({ variable, modeId, table = false }) => {
    const blockRef = useRef(null);
    const value = variable.valuesByMode[modeId];
    let color = value as Color;
    const name = variable.actualName; // Allow name to be JSX.Element or string

    const [isHovering, setIsHovering] = useState(false);
    const cssColor = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${color.a ?? 1})`;
    let hexColor: JSX.Element = <div>{rgbaToHex(color.r, color.g, color.b, color.a ?? 1)}</div>;
    let linkIcon = null;

    if (isVariableAlias(value)) {
        hexColor = (
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {aliasNameTag(value.source)}
            </div>
        );
        color = value.source.valuesByMode[modeId] as Color;
        linkIcon = (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <IconLink16 />
            </div>
        );
    }

    const handleHover = (hoverState: boolean) => {
        setIsHovering(hoverState);
        console.log('HOVER ', hoverState);
    };

    variable.onHover?.(isHovering);

    const boxShadow = isHovering ? '0 0 6px 2px rgba(0, 0, 0, 0.3)' : '0 0 2px #000';

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginRight: '10px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%', // Ensure the container takes full width
                    position: 'relative',
                }}
            >
                <div
                    ref={blockRef}
                    id={variable.id}
                    style={{
                        backgroundColor: cssColor,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        boxShadow,
                        cursor: 'pointer',
                        position: 'relative',
                    }}
                    className="w-7 h-7 rounded-full cursor-pointer"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {linkIcon}
                </div>
                {table && (
                    <div style={{ marginLeft: '5px', flex: 1, overflow: 'hidden', position: 'relative' }}>
                        {hexColor}
                    </div>
                )}
            </div>

            {isHovering && (
                <div
                    style={{
                        position: 'absolute',
                        backgroundColor: '#333',
                        color: 'white',
                        padding: '5px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        top: '30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000, // Ensure it's on top when displayed
                    }}
                >
                    <div style={{ fontWeight: 'bold' }}>{name}</div>
                    <div
                        style={{
                            backgroundColor: '#999',
                            color: '#4c4c4c',
                            padding: '2px',
                            marginTop: '4px',
                            borderRadius: '4px',
                            textAlign: 'center',
                        }}
                    >
                        {hexColor}
                    </div>
                    <div>{codeSyntaxTags(variable)}</div>
                </div>
            )}
        </div>
    );
};

export default ColorBlock;

const rgbaToHex = (r: number, g: number, b: number, a: number = 1): string => {
    // Convert the RGB values to HEX
    const rHex = Math.round(r * 255)
        .toString(16)
        .padStart(2, '0');
    const gHex = Math.round(g * 255)
        .toString(16)
        .padStart(2, '0');
    const bHex = Math.round(b * 255)
        .toString(16)
        .padStart(2, '0');

    // Only add the alpha component if it's less than 1
    let hexColor = `#${rHex}${gHex}${bHex}`;
    if (a < 1) {
        const aHex = Math.round(a * 255)
            .toString(16)
            .padStart(2, '0');
        hexColor += aHex;
    }

    return hexColor;
};
