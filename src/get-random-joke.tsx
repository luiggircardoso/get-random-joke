import { Detail, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { useEffect, useState, useCallback } from "react";

const API_URL =
  "https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Pun?blacklistFlags=nsfw,religious,political,racist,sexist,explicit";

type JokeResponse = {
  category?: string;
  type?: string;
  setup: string;
  delivery: string;
};

export default function Command() {
  const [joke, setJoke] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchJoke = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: JokeResponse = await response.json();
      let jokeText = "";
      if (data.type === "twopart") {
        jokeText = `${data.setup}\n\n${data.delivery}`;
      } else if ("joke" in data) {
        // @ts-expect-error not all responses have a joke property
        jokeText = data.joke;
      }
      setJoke(jokeText);
    } catch (error) {
      console.error(error);
      showToast({
        style: Toast.Style.Failure,
        title: "Something went wrong",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJoke();
  }, [fetchJoke]);

return (
    <Detail
        isLoading={isLoading}
        markdown={joke ? `## ${joke}` : "Loading joke..."}
        navigationTitle="Random Joke"
        actions={
            <ActionPanel>
                <Action.CopyToClipboard title="Copy Joke" content={joke || "No joke available"} />
                <Action title="Re-roll Joke" icon={Icon.Repeat} onAction={fetchJoke} />
            </ActionPanel>
        }
    />
);
}
