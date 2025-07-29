import React from 'react'

import '@mantine/core/styles.css'; //import Mantine V7 styles needed by MRT
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //import MRT styles
import { useMemo } from 'react';
import {useMantineReactTable, MantineReactTable } from 'mantine-react-table';

const MentineTable = () => {
     const data = useMemo(() => {
    const dataStorage = (storage) => {
      const results = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        try {
          const value = JSON.parse(storage.getItem(key));
          if (
            typeof value === 'object' &&
            value.connection_name &&
            value.db_name
          ) {
            results.push(value);
          }
        } catch {
          continue; // skip invalid JSON
        }
      }

      return results;
    };

    const localData = dataStorage(localStorage);
    const sessionData =dataStorage(sessionStorage);

    return [...localData, ...sessionData];
  }, []);
  
    const columns = useMemo(()=>[
        {
            accessorKey: "connection_name",
            header: "Connection Name"
        },
           {
            accessorKey: "db_name",
            header: "DataBase Name"
        },
    ],[]);

    const table = useMantineReactTable({
        columns,
        data,
    });
    return (
        <div>
            <MantineReactTable table={table}/>
        </div>
    )
}

export default MentineTable