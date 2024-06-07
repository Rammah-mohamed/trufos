import {InputTabs} from '@/components/mainWindow/tabs/InputTabs';
import {OutputTabs} from '@/components/mainWindow/tabs/OutputTabs';
import {HttpHeaders} from "shim/http";

export type RequestBodyProps = {
  headers?: HttpHeaders;
  body?: string;
}

export function RequestBody(props: RequestBodyProps) {
  const {body, headers} = props;

  return (
    <div className={'flex-1 grid grid-cols-2 gap-6'}>
      <div className='rounded-sm m-0'><InputTabs/></div>
      <div className='rounded-sm m-0'><OutputTabs body={body} headers={headers}/></div>
    </div>
  );
}
