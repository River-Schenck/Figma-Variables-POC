import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Input, Table, Checkbox } from 'antd';
import { Group, Variable, VariableCollection, VariableMode } from './figma_types';
import { IconCaretDown16, IconCaretRight16 } from '@frontify/fondue';
import styles from './style.module.css';
import {
    codeSyntaxTags,
    listAllReferenceAliasesWithFlyout,
    renderVariableComponent,
    renderVariableIcon,
} from './helpers';

type VariableTableProps = {
    collection: VariableCollection;
    isEditing: boolean;
};

export const VariableTable: FC<VariableTableProps> = ({ collection, isEditing }) => {
    const [isCollectionOpen, setIsCollectionOpen] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleCollectionVisibility = () => setIsCollectionOpen(!isCollectionOpen);

    const flattenGroups = useCallback((groups: Group[], modes: VariableMode[], keys: string[] = []): any[] => {
        const flatData: any[] = [];
        for (const group of groups) {
            const groupData: {
                key: string;
                isGroup: boolean;
                name: string;
                children: (Group | Variable)[];
                hidden: boolean;
            } = {
                key: `group-${group.name}`,
                isGroup: true,
                name: group.name,
                children: [],
                hidden: group.hidden,
            };
            keys.push(groupData.key); // Collecting keys for all groups and subgroups

            if (group.variables) {
                groupData.children.push(
                    ...group.variables.map((variable) => ({
                        ...variable,
                        key: variable.id,
                    })),
                );
            }
            if (group.groups) {
                groupData.children.push(...flattenGroups(group.groups, modes, keys));
            }
            flatData.push(groupData);
        }
        return flatData;
    }, []);

    useEffect(() => {
        const allGroupKeys: string[] = [];
        flattenGroups(collection.groups, collection.modes, allGroupKeys);
        setExpandedGroups(allGroupKeys);
    }, [collection.groups, collection.modes, flattenGroups]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const getAllGroupNames = useCallback((groups: Group[]): { text: string; value: string }[] => {
        let names: { text: string; value: string }[] = [];
        for (const group of groups) {
            names.push({ text: group.name, value: `group-${group.name}` });
            if (group.groups) {
                names = names.concat(getAllGroupNames(group.groups));
            }
        }
        return names;
    }, []);

    const groupFilterOptions = useMemo(
        () => getAllGroupNames(collection.groups),
        [getAllGroupNames, collection.groups],
    );

    const filteredDataSource = flattenGroups(collection.groups, collection.modes).filter((item) => {
        console.log(item)
        if (!isEditing && item.hidden) {
            return false;
        }
        return (
            item.name.toLowerCase().includes(searchTerm) ||
            item.children.some((child: Group | Variable) => child.name.toLowerCase().includes(searchTerm))
        );
    });

    const columns = useMemo(() => {
        const baseColumns = [
            {
                title: 'Group',
                dataIndex: 'name',
                key: 'group',
                filters: groupFilterOptions,
                onFilter: (value, record) => record.key === value || (record.parentKey && record.parentKey === value),
                filterMultiple: false,
                render: (text: string, record: any) => {
                    if (record.isGroup) {
                        return {
                            children: <div className={styles.groupHeader}>{text}</div>,
                            props: {
                                colSpan: collection.modes.length + 2, // Span across all columns for groups
                            },
                        };
                    } else {
                        return {
                            children: '',
                            props: {
                                colSpan: 1,
                            },
                        };
                    }
                },
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (text: string, record: any) => {
                    if (!record.isGroup) {
                        return {
                            children: (
                                <div
                                    className={styles.variableName}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {renderVariableIcon(record)}
                                        <div style={{ marginLeft: '10px' }}>{record.actualName}</div>
                                        {listAllReferenceAliasesWithFlyout(record)}
                                    </div>
                                    <div>{codeSyntaxTags(record)}</div>
                                </div>
                            ),
                            props: {
                                colSpan: 1, // Ensure this cell is rendered for variables
                            },
                        };
                    } else {
                        return {
                            children: null,
                            props: {
                                colSpan: 0,
                            },
                        };
                    }
                },
            },
            ...collection.modes.map((mode) => ({
                title: mode.name,
                dataIndex: mode.modeId,
                key: mode.modeId,
                render: (text: string, record: any) => {
                    if (!record.isGroup) {
                        return {
                            children: renderVariableComponent(record, mode.modeId, true),
                            props: {
                                colSpan: 1, // Ensure these cells are rendered for variables
                            },
                        };
                    } else {
                        return {
                            children: null,
                            props: {
                                colSpan: 0,
                            },
                        };
                    }
                },
            })),
        ];

        if (isEditing) {
            baseColumns.unshift({
                title: 'Select',
                dataIndex: 'hidden',
                key: 'select',
                render: (text: string, record: any) => ({
                    children: (
                        <Checkbox
                            checked={!record.hidden}
                            onChange={(e) => handleCheckboxChange(record, e.target.checked)}
                        />
                    ),
                    props: {
                        colSpan: 1,
                    },
                }),
            });
        }

        return baseColumns;
    }, [isEditing, collection.modes]);

    const handleCheckboxChange = (record: any, checked: boolean) => {
        // Logic to update the hidden status of the group or variable
        record.hidden = !checked;
    };

    return (
        <div style={{ marginBottom: '30px' }}>
            <div>
                <Input placeholder="Search..." onChange={handleSearch} style={{ marginBottom: 20, width: 300 }} />
            </div>
            <div onClick={toggleCollectionVisibility} className={styles.paletteCollectionHeader}>
                {isCollectionOpen ? <IconCaretDown16 /> : <IconCaretRight16 />} {collection.name}
            </div>
            <Table
                columns={columns}
                dataSource={filteredDataSource}
                pagination={false}
                expandedRowKeys={expandedGroups}
                sticky={{ offsetHeader: 5 }}
                bordered
                scroll={{ x: 'max-content' }} // This enables horizontal scrolling
            />
        </div>
    );
};

export default VariableTable;
