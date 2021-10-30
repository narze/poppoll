<script lang="ts">
  import axios from "axios"
  import slocation from "slocation"

  export let id: string
  let poll
  let options

  $: options = poll?.poll_option.map((option) => option.name) || []
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
  {#each options as option}
    <button disabled={true} class="rounded border px-2">{option}</button>
  {/each}

  URL
  <input type="text" readonly={true} class="rounded border" value={$slocation.href} />
</main>
