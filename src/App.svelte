<script lang="ts">
  import "twind/shim"
  import { tw } from "twind"

  import Flatpickr from "svelte-flatpickr"
  import "flatpickr/dist/flatpickr.css"

  import logo from "./assets/svelte.png"
  import Head from "./lib/Head.svelte"
  import Kofi from "./lib/Kofi.svelte"
  import Menu from "./lib/Menu.svelte"
  import Social from "./lib/Social.svelte"

  const url = "https://single-page-svelte.vercel.app"
  const title = "Single Page Svelte"

  const menuItems = [{ name: "Github", url: "https://github.com/narze/single-page-svelte" }]

  const description = "Build a single page app with Svelte, quickly."
  const imageUrl =
    "https://raw.githubusercontent.com/narze/timelapse/master/projects/single-page-svelte_home.png"
  const gtagId = null

  let pollStartTime,
    formattedValue,
    pollName: string,
    pollTime: number = 1,
    pollOptions: string[] = ["", ""],
    canRemoveOption: boolean = false

  const options = {
    enableTime: true,
    onChange(selectedDates, dateStr) {
      console.log("flatpickr hook", selectedDates, dateStr)
    },
  }

  $: console.log({ pollStartTime, formattedValue })

  function handleChange(event) {
    const [selectedDates, dateStr] = event.detail
    console.log({ selectedDates, dateStr })
  }

  function handleSubmit(event) {
    event.preventDefault()

    console.log(event.target.elements["date"].value)
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
</script>

<Kofi name="narze" label="Support Me" />
<Menu items={menuItems} />
<Social {url} {title} />
<Head {title} {description} {url} {imageUrl} {gtagId} />

<main class="w-full h-screen flex flex-col gap-4 justify-center items-center">
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
      <Flatpickr
        {options}
        bind:value={pollStartTime}
        bind:formattedValue
        on:change={handleChange}
        placeholder="Time"
        name="start-time"
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
            <input type="text" class="w-60 border rounded text-center px-2" bind:value={option} />
            {#if canRemoveOption}
              <button
                class="w-6 border rounded bg-red-200 border-red-300"
                on:click={() => removeOption(idx)}>-</button
              >
            {/if}
          </span>
        {/each}
        <button class="w-60 border rounded bg-green-200 border-green-300" on:click={addOption}
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
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
      "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>
