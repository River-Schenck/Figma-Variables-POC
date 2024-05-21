/* eslint-disable prettier/prettier */
import type { FC } from 'react';
import { useBlockAssets, useBlockSettings, useEditorState } from '@frontify/app-bridge';
import type { BlockProps } from '@frontify/guideline-blocks-settings';
import React, { useEffect, useState } from 'react';
import { FigmaApi, VariableCollection } from './figma_types';
import { prepareCollectionsWithCategories } from './helpers';
import CollectionPalette from './palette';
import TableView from './TableView';

export const FigmaVariables: FC<BlockProps> = ({ appBridge }) => {
    const [blockSettings] = useBlockSettings(appBridge);
    const { blockAssets } = useBlockAssets(appBridge);
    const isEditing = useEditorState(appBridge);
    const figmaSourceFileUrl = blockAssets?.figmaSourceFile?.[0].externalUrl;
    const viewMode = blockSettings?.layout;
    const [collections, setCollections] = useState<{ [collectionId: string]: VariableCollection } | null>(null);


    const extractFigmaFileKey = (url: string) => {
        try {
            console.log('Source: ', url);
           // Parse the main URL
            const parsedUrl = new URL(url);
            // Extract the 'url' query parameter and decode it
            const innerUrl = decodeURIComponent(parsedUrl.searchParams.get('url') || '');
            console.log('Decoded URL:', innerUrl);

            // Parse the extracted URL
            const innerParsedUrl = new URL(innerUrl);
            const pathSegments = innerParsedUrl.pathname.split('/');
            const fileIndex = pathSegments.findIndex(segment => segment === 'file');
            const result = fileIndex !== -1 ? pathSegments[fileIndex + 1] : null;
            console.log('Extracted file key:', result);
            return result;
        } catch (error) {
            console.error('Error parsing Figma URL:', error);
            return null;
        }
    };


    useEffect(() => {
        // Async function to fetch data
        const fetchData = async (fileKey: string) => {
            const api = new FigmaApi(token);
            try {
                const data = await api.getLocalVariables(fileKey);
                console.log(data);
                const processedData = prepareCollectionsWithCategories(data);
                setCollections(processedData);
                console.log(processedData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        if(figmaSourceFileUrl && viewMode){
            const fileKey = extractFigmaFileKey(figmaSourceFileUrl);
            if(fileKey){
                fetchData(fileKey);
            }
        }
    }, [figmaSourceFileUrl, viewMode, blockAssets, blockSettings]);
    
    return (
        <div>
            {collections && Object.entries(collections).map(([collectionId, collection]) => (
                <div key={collectionId}>
                    {viewMode === 'table' ? <TableView collection={collection} isEditing={isEditing} /> : <CollectionPalette collection={collection} />}
                </div>
            ))}
        </div>
    );
    
};