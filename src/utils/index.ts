export function processParams(acceptParams: any[], receivedParams: any): string {
  const validParams: string[] = [];

  acceptParams.forEach((param: any) => {
    if (param in receivedParams) {
      validParams.push(`${param}=${receivedParams[param]}`);
    }
  });

  return validParams.join(",");
}
