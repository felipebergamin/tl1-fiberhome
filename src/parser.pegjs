{
  function splitArray(arr, chunkSize) {
    let groups = [], i;
    for (i = 0; i < arr.length; i += chunkSize) {
      groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
  }

  function normalizeValues(values, attribs) {
    let groups = [], i;
    for (i = 0; i < values.length; i += attribs.length) {
      const group = values.slice(i, i + attribs.length);
      const obj = {};

      for (let y = 0; y < attribs.length; y++) {
        obj[attribs[y]] = group[y];
      }

      groups.push(obj);
    }
    return groups;
  }
}

start = commandResponse

commandResponse
  = operationCommand:operationCommand { return { type: "operationCommand", ...operationCommand } }
  / queryCommand:queryCommand { return { type: "queryCommand", ...queryCommand } }
  

operationCommand
  = header:header response_id:response_id response_block:response_block terminator:terminator { return { ...header, ...response_id, ...response_block, ...terminator } }

queryCommand
  = header:header response_id:response_id response_block:response terminator:terminator { return { ...header, ...response_id, ...response_block, ...terminator } }

header
  = crlf _ sid:sid _ date:date _ time:time { return {sid, date, time} }
  / crlf _ date:date _ time:time { return {date, time} }

response_id
  = crlf "M" _ ctag:ctag _ completion_code:completion_code { return { ctag, completion_code } }
  / crlf "M" _ completion_code:completion_code { return { completion_code } }

completion_code
  = completion_code:[a-zA-Z]+ {return completion_code.join("") }

ctag
  = ctag:[a-zA-Z0-9]+ {return ctag.join("") }

sid
  = sid:[A-Za-z0-9_\.]+ { return sid.join("") }

date
  = year:[0-9]+ "-" mount:[0-9]+ "-" day:[0-9]+ { return year.join("") + "-" + mount.join("") + "-" + day.join("") }

time
  = hour:[0-9]+ ":" minute:[0-9]+ ":" second:[0-9]+ { return `${hour.join("")}:${minute.join("")}:${second.join("")}` }

response
  = response_block / quotedLine

response_block
  = crlf _ "EN=" error_code:[0a-zA-Z]+ _ "ENDESC=" error_description:[0-9a-zA-Z =':]+ { return {error_code: error_code.join(""), error_description: error_description.join("")} }

quotedLine
  = crlf _ "total_blocks=" total_blocks:[0-9]+
  crlf _ "block_number=" block_number:[0-9]+
  crlf _ "block_records=" block_records:[0-9]+ result:result { return { total_blocks: +total_blocks.join(""), block_number: +block_number.join(""), block_records: +block_records.join(""), result } }

terminator "terminator"
  = crlf _ terminator:[;|>] { return {terminator} }

result
  = crlf title:[_\-a-zA-Z0-9 ]* crlf
  [@]+ crlf
  attribs:attribs crlf
  values:values
  [@]+ crlf { return { title: title.join(""), attribs, values: normalizeValues(values, attribs)} }

attribs
  = (tab attrib:[a-zA-Z ]+ { return attrib.join(""); } )*

values
  = (tab v:[_:a-zA-Z0-9-.\[\] ]+ crlf { return v.join("") } )*

tab
  = [\t]*

_ "whitespace"
  = [ \t]* { return '' }

crlf "linebreak"
  = [\n\r]* { return '' }
