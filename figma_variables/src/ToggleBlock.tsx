import { Switch } from '@frontify/fondue';
import React, { FC, useState } from 'react';
import { Variable } from './figma_types';

type DisplayBlockProps = {
    variable: Variable;
    modeId: string;
    table?: boolean;
};

const DisplayBlock: FC<DisplayBlockProps> = ({ variable, modeId, table = false }) => {
    const name = variable.actualName;
    const value = variable.valuesByMode[modeId];
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginRight: '3px', zIndex: isHovering ? 1 : 0 }}>
            <div
                style={{
                    border: table ? '0px' : '1px solid #343434',
                    width: 'auto', // Adjust width as needed
                    borderRadius: '4px', // Rounded corners
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px 6px 2px 6px',
                    justifyContent: 'center',
                    fontSize: '13px', // Adjust font size as needed
                    marginBottom: '4px',
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div>
                    {!table && name}
                    <Switch mode={value ? 'on' : 'off'} />
                </div>
            </div>

            {isHovering && (
                <div
                    style={{
                        position: 'absolute',
                        backgroundColor: '#333',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        top: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
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
                        {value ? 'True' : 'False'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisplayBlock;
