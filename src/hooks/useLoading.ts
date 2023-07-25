import { Dispatch, SetStateAction, useState } from "react";

type useLoadingType = (
  defaultValue?: boolean
) => [boolean, Dispatch<SetStateAction<boolean>>];

export const useLoading: useLoadingType = (defaultValue = false) => {
  const [isLoading, setIsLoading] = useState(defaultValue);

  return [isLoading, setIsLoading];
};
