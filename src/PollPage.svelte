<script lang="ts">
  import { onDestroy } from "svelte"
  import axios from "axios"
  import slocation from "slocation"
  import dayjs from "dayjs"
  import relativeTime from "dayjs/plugin/relativeTime"

  dayjs.extend(relativeTime)

  export let id: string
  let poll
  let options: Array<{ id: string; name: string; count: number }>
  let optionsCount: Array<{ id: string; name: string; count: number }>
  let hours, minutes, seconds
  let interval
  let isStarted

  $: options = poll?.poll_option || []
  $: optionsCount = options.map((option) => {
    return {
      id: option.id,
      name: option.name,
      count: 0,
    }
  })

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

  function pop(id) {
    return () => {
      optionsCount = optionsCount.map((option) => {
        if (option.id === id) {
          return {
            ...option,
            count: option.count + 1,
          }
        } else {
          return option
        }
      })
    }
  }
</script>

<main class="w-full h-screen flex flex-col gap-4 justify-center items-center">
  <h1 class="text-3xl text-green-400 flex flex-col">Poll : {`${poll?.name}`}</h1>

  {#if isStarted === false}
    {#if poll}
      {#each options as option}
        <button disabled={true} class="rounded border px-2 w-32">{option.name}</button>
      {/each}

      <h2 class="text-2xl">
        Poll will start in {hours} hours {minutes} minutes {seconds} seconds
      </h2>
    {/if}
  {:else if isStarted}
    {#if poll}
      {#each options as option}
        <button class="rounded border px-2 w-32" on:click={pop(option.id)}>{option.name}</button>
      {/each}

      <h2 class="text-2xl">
        Poll will end in {hours} hours {minutes} minutes {seconds} seconds
      </h2>
    {/if}
  {/if}

  <p>Share URL</p>
  <input type="text" readonly={true} class="rounded border" value={$slocation.href} />
</main>
