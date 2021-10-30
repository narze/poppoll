<script lang="ts">
  import "twind/shim"
  import { tw } from "twind"
  import axios from "axios"
  import slocation from "slocation"
  import dayjs from "dayjs"
  import utc from "dayjs/plugin/utc"

  dayjs.extend(utc)

  import Head from "./lib/Head.svelte"
  import Kofi from "./lib/Kofi.svelte"
  import Menu from "./lib/Menu.svelte"
  import Social from "./lib/Social.svelte"
  import PollPage from "./PollPage.svelte"
  import baseUrl from "./lib/constants"

  const url = "https://single-page-svelte.vercel.app"
  const title = "PopPoll"

  const menuItems = [{ name: "Github", url: "https://github.com/narze/single-page-svelte" }]

  const description = "Build a single page app with Svelte, quickly."
  const imageUrl =
    "https://raw.githubusercontent.com/narze/timelapse/master/projects/single-page-svelte_home.png"
  const gtagId = null
  const pollId = ""

  let pollStartTime,
    formattedPollStartTime = dayjs().local().format("YYYY-MM-DDTHH:mm"),
    pollName: string,
    pollTime: number = 5,
    pollOptions: string[] = ["", ""],
    canRemoveOption: boolean = false

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateInputs()) {
      alert("Invalid inputs")
      return
    }

    const pollEndTime = new Date(pollStartTime.getTime() + pollTime * 60000)

    const { data } = await axios.post(
      `${baseUrl}/polls`,
      {
        name: pollName,
        start_at: pollStartTime,
        end_at: pollEndTime,
        options: pollOptions.map((option) => ({ name: option })),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    )

    const key = data.key

    location.hash = `#/polls/${key}`
  }

  function validateInputs() {
    if (!pollName || !pollStartTime || !pollOptions.length) {
      return false
    }

    if (pollOptions.filter((option) => option.trim().length === 0).length) {
      return false
    }

    return true
  }

  function addOption() {
    pollOptions = [...pollOptions, ""]
  }

  function removeOption(index) {
    if (!canRemoveOption) {
      return
    }
    pollOptions = pollOptions.filter((_, i) => i !== index)
  }

  $: canRemoveOption = pollOptions.length > 2

  $: pollStartTime = new Date(formattedPollStartTime)
</script>

<Kofi name="narze" label="Support Me" />
<Menu items={menuItems} />
<Social {url} {title} />
<Head {title} {description} {url} {imageUrl} {gtagId} />

<main class="w-full h-screen flex flex-col gap-4 justify-center items-center">
  {#if $slocation.hash.startsWith("#/polls/")}
    <PollPage id={$slocation.hash.replace("#/polls/", "")} />
  {:else}
    <h1 class="text-6xl text-green-400 flex flex-col">PopPoll</h1>

    <form on:submit={handleSubmit} class="flex flex-col gap-2">
      <div class="flex gap-2">
        <label for="name" class="w-28 text-right">Name</label>
        <input
          type="text"
          id="name"
          placeholder="Poll Name"
          bind:value={pollName}
          class={tw`w-60 border rounded text-center px-2`}
        />
      </div>

      <div class="flex gap-2">
        <label for="start-time" class="w-28 text-right">Poll Start Time</label>

        <input
          type="datetime-local"
          id="start-time"
          name="start-time"
          bind:value={formattedPollStartTime}
          class="w-60 border rounded text-center px-2"
        />
      </div>

      <div class="flex gap-2">
        <label for="poll-time" class="w-28 text-right">Time limit</label>
        <input
          type="number"
          class="w-60 border rounded text-center px-2"
          bind:value={pollTime}
          min={1}
        /> Minute(s)
      </div>

      <div class="flex gap-2">
        <label for="poll-options" class="w-28 text-right">Poll Options</label>
        <div class="flex flex-col gap-2">
          {#each pollOptions as option, idx (idx)}
            <span>
              <input
                type="text"
                class="w-60 border rounded text-center px-2"
                bind:value={option}
                placeholder={`Option ${idx + 1}`}
              />
              {#if canRemoveOption}
                <button
                  type="button"
                  class="w-6 border rounded bg-red-200 border-red-300"
                  on:click={() => removeOption(idx)}>-</button
                >
              {/if}
            </span>
          {/each}
          <button type="button" class="w-60 border rounded bg-green-200 border-green-300" on:click={addOption}
            >+ Add new option</button
          >
        </div>
      </div>

      <div class="flex justify-center">
        <button type="submit" class="text-center rounded border px-4 py-2 text-lg">
          Create Poll
        </button>
      </div>
    </form>
  {/if}
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
      "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>
