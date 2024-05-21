import React, { useState } from 'react';
import { SegmentedControls } from '@frontify/fondue'; // Adjust the import path based on your setup
import { VariableCollection, VariableMode } from './figma_types';

export const ModeSelector: React.FC<{ collection: VariableCollection }> = ({ collection }) => {
    const [activeModeId, setActiveModeId] = useState(collection.defaultModeId);

    const handleModeChange = (newModeId: string) => {
        setActiveModeId(newModeId);
        // Additional actions when mode changes, if necessary
    };

    return (
        <SegmentedControls
            key="modeSelector"
            activeItemId={activeModeId}
            items={collection.modes.map((mode: VariableMode) => ({
                id: mode.modeId,
                value: mode.name,
            }))}
            onChange={(newModeId) => handleModeChange(newModeId)}
            size="medium"
        />
    );
};
