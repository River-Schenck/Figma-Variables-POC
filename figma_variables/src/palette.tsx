import React, { FC, useState } from 'react';
import { Group, Variable, VariableCollection } from './figma_types';
import styles from './style.module.css';
import { IconCaretDown16, IconCaretRight16, SegmentedControls } from '@frontify/fondue';
import { renderVariableComponent } from './helpers';

type CollapsibleGroupProps = {
    group: Group;
    modeId: string;
};

const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({ group, modeId }) => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div>
            <div onClick={toggleOpen} className={styles.paletteGroupHeader}>
                {isOpen ? <IconCaretDown16 /> : <IconCaretRight16 />} {group.name}
            </div>
            {isOpen && (
                <div className={styles.paletteGroupContainer}>
                    {group.variables &&
                        group.variables.map((variable: Variable) => (
                            <div key={variable.id} style={{ display: 'inline-block', marginLeft: '5px' }}>
                                {renderVariableComponent(variable, modeId)}
                            </div>
                        ))}
                    {group.groups &&
                        group.groups.map((childGroup: Group) => (
                            <CollapsibleGroup key={childGroup.name} group={childGroup} modeId={modeId} />
                        ))}
                </div>
            )}
        </div>
    );
};

type CollectionPaletteProps = {
    collection: VariableCollection;
};

const CollectionPalette: FC<CollectionPaletteProps> = ({ collection }) => {
    const [isCollectionOpen, setIsCollectionOpen] = useState(true);
    const [activeModeId, setActiveModeId] = useState(collection.defaultModeId);

    const toggleCollectionVisibility = () => setIsCollectionOpen(!isCollectionOpen);
    const handleModeChange = (newModeId: string) => setActiveModeId(newModeId);

    return (
        <div style={{ marginBottom: '30px' }}>
            <div onClick={toggleCollectionVisibility} className={styles.paletteCollectionHeader}>
                {isCollectionOpen ? <IconCaretDown16 /> : <IconCaretRight16 />} {collection.name}
            </div>

            {isCollectionOpen && (
                <>
                    <div className={styles.segmentedControlsContainer}>
                        <SegmentedControls
                            key="modeSelector"
                            activeItemId={activeModeId}
                            items={collection.modes.map((mode) => ({
                                id: mode.modeId,
                                value: mode.name,
                            }))}
                            onChange={handleModeChange}
                            size="small"
                        />
                    </div>
                    <div>
                        {collection.groups.map((group: Group) => (
                            <CollapsibleGroup key={group.name} group={group} modeId={activeModeId} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CollectionPalette;
