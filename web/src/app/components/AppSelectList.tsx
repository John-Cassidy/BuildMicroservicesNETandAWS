import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { UseControllerProps, useController } from 'react-hook-form';

interface IProps extends UseControllerProps {
  label: string;
  items: string[];
}

export const AppSelectList = (props: IProps) => {
  const { fieldState, field } = useController({ ...props, defaultValue: '' });
  return (
    <FormControl fullWidth error={!!fieldState.error}>
      <InputLabel>{props.label}</InputLabel>
      <Select value={field.value} label={props.label} onChange={field.onChange}>
        <MenuItem
          value=''
          sx={(theme) => ({
            height: '2em',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <em> </em>
        </MenuItem>
        {props.items.map((item, index) => (
          <MenuItem value={item} key={index}>
            {item}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{fieldState.error?.message}</FormHelperText>
    </FormControl>
  );
};
