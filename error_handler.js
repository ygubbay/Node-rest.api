
exports.checkRequiredParam = checkRequiredParam;
exports.appError = appError;

function logError(msg) 
{
	console.log(msg);
}

function appError(res, apiFunc, httpStatusCode, errorMessage)
{
	var errorObj = { 'Http Status': httpStatusCode, 'Error Message': errorMessage };
	
	logError(apiFunc + ': ' + JSON.stringify(errorObj));
	
	
	res.statusCode = httpStatusCode;
	res.writeHead(httpStatusCode, errorMessage, {'content-type' : 'text/plain'});
	res.end(errorMessage);
	return;	
}

function checkRequiredParam(res, apiFunction, paramName, paramVal)
{
	if (paramVal == undefined)
	{
		appError(res, apiFunction, 400, apiFunction + ': Missing parameter [' + paramName + '].');
		return false;
	}
	return true;
}