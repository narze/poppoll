<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import slocation from "slocation"
  import dayjs from "dayjs"
  import relativeTime from "dayjs/plugin/relativeTime"
  import popSound from "./assets/pop.ogg"
  import db from "./lib/db"
  dayjs.extend(relativeTime)

  export let id: string
  let loading = true
  let poll
  let options: Array<{ id: number; name: string; count: number }>
  let optionsCount: Array<{ id: number; name: string; count: number }>
  let hours, minutes, seconds
  let interval, sendResultInterval
  let isStarted, isEnded
  let popAudio = new Audio(popSound)

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
    }, 2000)
  }

  onMount(async () => {
    poll = await db.polls.get(id)
    loading = false
  })

  onDestroy(() => {
    clearInterval(interval)
    clearInterval(sendResultInterval)
  })

  function pop(id) {
    return () => {
      popAudio.play()
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
    if (document.hidden) {
      return
    }

    const payload = optionsCount.filter((option) => option.count > 0)
    optionsCountPending = [...optionsCount]
    optionsCount = optionsDefault

    const result = await db.polls.upvote(id, payload)
    optionsCountPending = optionsDefault
    options = result?.poll_option || []
  }
</script>

<main class="w-full h-screen flex flex-col gap-4 justify-center items-center">
  {#if loading}
    Loading...
  {:else}
    <h1 class="text-3xl md:text-6xl text-green-400 flex flex-col">Poll : {`${poll?.name}`}</h1>

    <!-- {JSON.stringify(optionsCount)} -->
    {#if isEnded}
      {#if poll}
        {#each options as option, idx (idx)}
          <button class="rounded border md:text-3xl px-2 w-32" disabled={true}
            >{option.name} : {option.count}</button
          >
        {/each}

        <h2 class="text-2xl md:text-6xl">Poll Ended</h2>
      {/if}
    {:else if isStarted === false}
      {#if poll}
        {#each options as option}
          <button disabled={true} class="rounded md:text-3xl border px-2 w-32">{option.name}</button
          >
        {/each}

        <h2 class="text-2xl md:text-3xl">
          Poll will start in {hours} hours {minutes} minutes {seconds} seconds
        </h2>
      {/if}
    {:else if isStarted}
      {#if poll}
        {#each options as option, idx (idx)}
          <div
            class="cursor-pointer rounded border text-center md:text-4xl px-2 w-32"
            on:click={pop(option.id)}
          >
            {option.name} : {option.count +
              optionsCount[idx]?.count +
              optionsCountPending[idx]?.count}
          </div>
        {/each}

        <h2 class="text-2xl md:text-4xl">
          Poll will end in {hours} hours {minutes} minutes {seconds} seconds
        </h2>
      {/if}
    {/if}

    <p>Share URL</p>
    <input type="text" readonly={true} class="rounded border md:text-3xl" value={$slocation.href} />

    <p><a href="/">Home</a></p>
  {/if}
</main>
