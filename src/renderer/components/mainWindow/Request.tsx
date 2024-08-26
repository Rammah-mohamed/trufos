import { cn } from '@/lib/utils';
import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ArrowRightIcon, BookmarkIcon } from '@radix-ui/react-icons';
import { useErrorHandler } from '@/components/ui/use-toast';
import { HttpService } from '@/services/http/http-service';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import { editor } from 'monaco-editor';
import {RequestBody, RequestMethod, RufusRequest} from "../../../shim/request";
import {HttpHeaders} from "../../../shim/headers";
import {randomUUID} from 'node:crypto';
import {RufusResponse} from "../../../shim/response";

export type RequestProps = {
  onResponse: (response: RufusResponse) => void;
}

const httpService = HttpService.instance;

// TODO: move to CSS as own class, e.g. .http-method-color-get, .http-method-color-put, ...
const HTTP_METHOD_COLOR_MAP = {
  GET: '#97E87F',
  PUT: '#6AC8E7',
  POST: '#8CA5FF',
  DELETE: '#E36873',
  PATCH: '#EBBA6B'
} as Record<RequestMethod, string>;

/**
 * Component for configuring the HTTP request URL and method and also sending the request.
 */
export function Request(props: RequestProps) {
  const { onResponse } = props;
  const urlInputRef = React.useRef<HTMLInputElement>(null);
  const httpMethodSelectRef = React.useRef<HTMLSpanElement>(null);
  const requestEditor = useSelector<RootState>(state => state.view.requestEditor) as editor.ICodeEditor | undefined;

  /**
   * Sends a request to the server with the current URL and HTTP method.
   */
  const sendRequest = React.useCallback(useErrorHandler(async () => {
      const httpMethod = httpMethodSelectRef.current?.innerText;
      const url = urlInputRef.current?.value;
      if (url === undefined || httpMethod === undefined) {
        throw new Error('Missing React reference to URL input or HTTP method select element');
      }
      let body: RequestBody = null;
      const headers: HttpHeaders = {};
      if (requestEditor !== undefined) {
        body = {
          type: 'text',
          text: requestEditor.getValue(),
          mimeType: 'text/plain'
        };
        headers['Content-Type'] = 'text/plain';
      }

      const request: RufusRequest = {
        id: randomUUID(),
        parentId: randomUUID(),
        type: 'request',
        title: 'Test Request',
        url: url,
        method: httpMethod as RequestMethod,
        headers: headers, // TODO: set the headers of the request
        body: body,
      };

      // Send the request and pass the response to the onResponse callback
      onResponse(await httpService.sendRequest(request));
    }),
    [urlInputRef, httpMethodSelectRef, requestEditor, onResponse]
  );

  /**
   * Changes the color of the HTTP method select element to match the selected method.
   */
  const handleHttpMethodChange = React.useCallback((value: RequestMethod) => {
    const select = httpMethodSelectRef.current;
    if (select !== null) {
      select.style.color = HTTP_METHOD_COLOR_MAP[value];
    }
  }, [httpMethodSelectRef]);

  return (
    <div className={cn('flex mb-[24px]')}>
      <Select defaultValue="GET" onValueChange={handleHttpMethodChange}>
        <SelectTrigger className={cn('w-[100px] rounded-bl rounded-tl')}>
          <SelectValue ref={httpMethodSelectRef} />
        </SelectTrigger>

        <SelectContent className="ml-2">
          <SelectGroup>
            {Object.entries(HTTP_METHOD_COLOR_MAP).map(([method, color]) => (
              <SelectItem key={method} value={method} style={{ color }}>{method}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Input ref={urlInputRef} type="url" inputMode="url" style={{ fontFamily: 'monospace' }}
             className={cn('rounded-br rounded-tr flex-grow w-full')} />

      <Button
        className={'gap-3 px-3 ml-2'}
        onClick={sendRequest}
        variant="outline"
      >
        <div><ArrowRightIcon /></div>

        <span className={'leading-4'}>Send</span>
      </Button>

      <Button className={'gap-3 px-3 ml-2'} variant="outline">
        <div><BookmarkIcon /></div>

        <span className={'leading-4'}>Save</span>
      </Button>
    </div>
  );
}
