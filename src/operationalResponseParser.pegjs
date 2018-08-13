start
  = operationalResponseFormat

operationalResponseFormat
  = header:header response_id:response_id response_block:response_block terminator:terminator { return { header, response_id, response_block, terminator } }

header
  = "\n\n   " sid:sid " " date:date " " time:time { return {sid, date, time} }

response_id
  = "\nM  " ctag:ctag " " completion_code:completion_code { return { ctag, completion_code } }

response_block
  = "\n   EN=" error_code:[0a-zA-Z_]+ "   ENDESC=" error_description:[a-zA-Z ]+ { return {error_code: error_code.join(""), error_description: error_description.join("")} }

terminator
  = [\n\r]+ terminator:[;|] { return {terminator} }

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
