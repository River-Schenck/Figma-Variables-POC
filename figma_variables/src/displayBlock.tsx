import React, { FC, useState } from 'react';
import { Variable } from './figma_types';

type DisplayBlockProps = {
    variable: Variable;
    modeId: string;
    light?: boolean;
};

const DisplayBlock: FC<DisplayBlockProps> = ({ variable, modeId, light = false }) => {
    const name = variable.actualName;
    const value = variable.valuesByMode[modeId] as string;
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginRight: '3px', zIndex: isHovering ? 1 : 0 }}>
            <div
                style={{
                    backgroundColor: light ? '#FFFFFF' : '#343434', // Black-grey background
                    color: light ? '#343434' : 'white', // Text color
                    border: '1px solid #343434',
                    width: 'auto', // Adjust width as needed
                    height: '20px', // Adjust height as needed
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
                {name}
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
                        {value}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisplayBlock;
