const name = "Imgur";
const onlineDoc = "https://apidocs.imgur.com/#authorization-and-oauth";

const keyPaths = {
  clientID: "client.identifier"
}

function config(util) {
  return [
    {
      "title": "Client ID",
      "type": "password",
      "key": keyPaths.clientID
    }
  ]
}

function request(file, options, util) {
  return {
    method: "POST",
    url: "https://api.imgur.com/3/image",
    header: {
      "Authorization": `Client-ID ${options[keyPaths.clientID]}`
    },
    files: [
      {
        "data": file.data,
        "name": "image"
      }
    ]
  };
}

function parse(data, path, options) {
  if (data.success) {
    return {
      remotePath: data.data.link
    };
  }

  return {
    error: JSON.stringify(data)
  };
}

module.exports = {
  name,
  onlineDoc,
  config,
  request,
  parse
}