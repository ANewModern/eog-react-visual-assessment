import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Input,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(1),
  },
  menuItemRoot: {
    '&:hover': {
      backgroundColor: 'rgba(110,133,168,0.08) !important',
    },
    '&$menuItemSelected, &$menuItemSelected:focus, &$menuItemSelected:hover': {
      backgroundColor: 'rgba(110,133,168,0.0)',
    },
  },
  menuItemOnClick: {
    color: '#6E85A8',
  },
  menuItemSelected: { backgroundColor: 'rgba(110,133,168,0.32)' },
  checkIcon: {
    color: '#6E85A8',
  },
  listItemTextRoot: {
    color: 'black',
  },
  dropdownStyle: {
    marginTop: 32,
  },
  labelStyles: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface PropTypes {
  selectedItems: string[];
  options: string[];
  setItemsParent: Function;
  title: string;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export default (props: PropTypes) => {
  const { selectedItems, options, setItemsParent, title } = props;
  const classes = useStyles();
  const [items, setItems] = useState(selectedItems ? selectedItems : []);

  const handleChange = (event: { target: { value: any } }) => {
    setItems(event.target.value);
  };

  useEffect(() => {
    const initialItems = selectedItems ? selectedItems : [];
    if (initialItems.join(',') !== items.join(',')) setItemsParent(items);
  }, [items, setItemsParent, selectedItems]);

  return (
    <FormControl className={classes.container} fullWidth>
      <InputLabel shrink>
        <span className={classes.labelStyles}>{title}</span>
      </InputLabel>
      <Select
        multiple
        value={items}
        onChange={handleChange}
        input={<Input />}
        MenuProps={{
          classes: { paper: classes.dropdownStyle },
          variant: 'menu',
          getContentAnchorEl: null,
          PaperProps: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
              width: 250,
            },
          },
        }}
        renderValue={(value: any) => {
          console.log(value);
          return value.join(', ');
        }}
      >
        {options.map((item, idx) => (
          <MenuItem
            key={`${item}-${idx}`}
            value={item}
            classes={{
              root: classes.menuItemRoot,
              selected: classes.menuItemSelected,
              gutters: classes.menuItemOnClick,
            }}
          >
            <ListItemText
              primary={item}
              classes={{
                root: classes.listItemTextRoot,
              }}
            />
            {items.indexOf(item) !== -1 && (
              <ListItemIcon>
                <CheckIcon className={classes.checkIcon} />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
