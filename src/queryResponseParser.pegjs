{
  function splitArray(arr, chunkSize) {
    let groups = [], i;
    for (i = 0; i < arr.length; i += chunkSize) {
      groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
  }
}

start
  = queryResponseFormat

queryResponseFormat
  = header:header response_id:response_id response_block:response_block terminator:terminator { return { header, response_id, response_block, terminator } }

header
  = linebreak _ sid:sid " " date:date " " time:time { return {sid, date, time} }

response_id
  = linebreak "M " ctag:ctag " " completion_code:completion_code { return { ctag, completion_code } }

response_block
  = linebreak _ "EN=" error_code:[0a-zA-Z_]+ _ "ENDESC=" error_description:[a-zA-Z ]+ { return {error_code: error_code.join(""), error_description: error_description.join("")} }
  / linebreak _ "total_blocks=" total_blocks:[0-9]+
  linebreak _ "block_number=" block_number:[0-9]+
  linebreak _ "block_records=" block_records:[0-9]+ linebreak result:result { return { total_blocks: +total_blocks.join(""), block_number: +block_number.join(""), block_records: +block_records.join(""), result } }

terminator
  = linebreak terminator:[;|] { return {terminator} }

ctag
  = ctag:[a-zA-Z]+ {return ctag.join("") }

completion_code
  = completion_code:[a-zA-Z]+ {return completion_code.join("") }

sid
  = sid:[A-Za-z0-9_\.]+ { return sid.join("") }

date
  = year:[0-9]+ "-" mount:[0-9]+ "-" day:[0-9]+ { return year.join("") + "-" + mount.join("") + "-" + day.join("") }

time
  = hour:[0-9]+ ":" minute:[0-9]+ ":" second:[0-9]+ { return `${hour.join("")}:${minute.join("")}:${second.join("")}` }

result
  = linebreak title:[_\-a-zA-Z0-9 ]+ linebreak
  [@]+ linebreak
  attribs:attribs linebreak
  values:values
  [@]+ linebreak { return { title: title.join(""), attribs, values: splitArray(values, attribs.length)} }

attribs
  = (_ attrib:[a-zA-Z]+ { return attrib.join(""); } )*

values
  = (_ v:[a-zA-Z0-9-.]+ linebreak { return v.join("") } )*

_ "whitespace"
  = [ \t]*

linebreak
  = [\n\r]*