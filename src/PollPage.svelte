<script lang="ts">
  import { onDestroy } from "svelte"
  import axios from "axios"
  import slocation from "slocation"
  import dayjs from "dayjs"
  import relativeTime from "dayjs/plugin/relativeTime"
  import baseUrl from "./lib/constants"

  dayjs.extend(relativeTime)

  export let id: string
  let poll
  let options: Array<{ id: number; name: string; count: number }>
  let optionsCount: Array<{ id: number; name: string; count: number }>
  let hours, minutes, seconds
  let interval, sendResultInterval
  let isStarted, isEnded

  $: options = poll?.poll_option || []
  $: options = options.sort((a, b) => {
    return a.id - b.id
  })
  $: optionsDefault = (poll?.poll_option || []).map((option) => {
    return {
      ...option,
      count: 0,
    }
  })
  $: optionsCount = optionsDefault
  $: optionsCountPending = optionsDefault

  $: if (poll) {
    const start_at = dayjs(poll.start_at)
    const end_at = dayjs(poll.end_at)

    interval = setInterval(() => {
      const now = dayjs()

      if (now >= end_at) {
        isEnded = true
        clearInterval(interval)
      } else if (now >= start_at) {
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

    sendResultInterval = setInterval(() => {
      if (isEnded) {
        sendResult()
        clearInterval(sendResultInterval)
      } else if (isStarted) {
        sendResult()
      }
    }, 10000)
  }

  onDestroy(() => {
    clearInterval(interval)
    clearInterval(sendResultInterval)
  })
  ;(async () => {
    const { data } = await axios.get(`${baseUrl}/polls/${id}`, {
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

  async function sendResult() {
    const payload = optionsCount.filter((option) => option.count > 0)

    optionsCountPending = [...optionsCount]

    optionsCount = optionsDefault

    const { data } = await axios.post(
      `${baseUrl}/polls/${id}/pop`,
      {
        data: payload,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    )

    optionsCountPending = optionsDefault

    options = data?.poll_option || []
  }
</script>

<main class="w-full h-screen flex flex-col gap-4 justify-center items-center">
  <h1 class="text-3xl text-green-400 flex flex-col">Poll : {`${poll?.name}`}</h1>

  <!-- {JSON.stringify(optionsCount)} -->
  {#if isEnded}
    {#if poll}
      {#each options as option, idx (idx)}
        <button class="rounded border px-2 w-32" disabled={true}
          >{option.name} : {option.count}</button
        >
      {/each}

      <h2 class="text-2xl">Poll Ended</h2>
    {/if}
  {:else if isStarted === false}
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
      {#each options as option, idx (idx)}
        <button class="rounded border px-2 w-32" on:click={pop(option.id)}
          >{option.name} : {option.count +
            optionsCount[idx]?.count +
            optionsCountPending[idx]?.count}</button
        >
      {/each}

      <h2 class="text-2xl">
        Poll will end in {hours} hours {minutes} minutes {seconds} seconds
      </h2>
    {/if}
  {/if}

  <p>Share URL</p>
  <input type="text" readonly={true} class="rounded border" value={$slocation.href} />
</main>
