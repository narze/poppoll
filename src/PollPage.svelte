<script lang="ts">
  import { onDestroy } from "svelte"
  import axios from "axios"
  import slocation from "slocation"
  import dayjs from "dayjs"
  import relativeTime from "dayjs/plugin/relativeTime"

  dayjs.extend(relativeTime)

  export let id: string
  let poll
  let options
  let hours, minutes, seconds
  let interval
  let isStarted

  $: options = poll?.poll_option.map((option) => option.name) || []

  $: if (poll) {
    interval = setInterval(() => {
      const now = dayjs()
      const start_at = dayjs(poll.start_at)
      const end_at = dayjs(poll.end_at)

      if (now >= start_at) {
        isStarted = true
        hours = Math.abs(end_at.diff(now, "hour"))
        minutes = Math.abs(end_at.diff(now, "minute") % 60)
        seconds = Math.abs(end_at.diff(now, "second") % 60)
      } else {
        isStarted = false
        hours = Math.abs(start_at.diff(now, "hour"))
        minutes = Math.abs(start_at.diff(now, "minute") % 60)
        seconds = Math.abs(start_at.diff(now, "second") % 60)
      }
    }, 1000)
  }

  onDestroy(() => {
    clearInterval(interval)
  })
  ;(async () => {
    const { data } = await axios.get(`http://localhost:8787/polls/${id}`, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })

    poll = data
  })()
</script>

<main class="w-full h-screen flex flex-col gap-4 justify-center items-center">
  <h1 class="text-3xl text-green-400 flex flex-col">Poll ID: {id}</h1>
  <!-- {"key":"UaUNyY8CuQoBsSBWI4lvu","name":"poll with option","start_at":"2021-10-29T21:52:09.728+00:00","end_at":"2021-10-29T21:53:09.728+00:00","poll_option":[{"name":"aaaa"},{"name":"bbbb"},{"name":"cccc"}] -->
  <!-- {JSON.stringify(poll)} -->
  {#if isStarted === false}
    {#if poll}
      {#each options as option}
        <button disabled={true} class="rounded border px-2">{option}</button>
      {/each}

      <h2 class="text-2xl">
        Poll will start in {hours} hours {minutes} minutes {seconds} seconds
      </h2>
    {/if}
  {:else if isStarted}
    {#if poll}
      {#each options as option}
        <button class="rounded border px-2">{option}</button>
      {/each}

      <h2 class="text-2xl">
        Poll will end in {hours} hours {minutes} minutes {seconds} seconds
      </h2>
    {/if}
  {/if}

  Start at : {poll?.start_at}
  end at : {poll?.end_at}

  <p>Share URL</p>
  <input type="text" readonly={true} class="rounded border" value={$slocation.href} />
</main>
