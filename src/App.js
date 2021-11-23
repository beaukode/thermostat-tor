import React from "react";
import {
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Slider,
  Typography,
} from "@mui/material";
import humanizeDuration from "humanize-duration";

const marks = [
  {
    value: 16,
    label: "16°C",
  },
  {
    value: 17,
    label: "17°C",
  },
  {
    value: 18,
    label: "18°C",
  },
  {
    value: 19,
    label: "19°C",
  },
  {
    value: 20,
    label: "20°C",
  },
];

function App() {
  const [lastUpdateAt, setLastUpdateAt] = React.useState();
  const [lastUpdateLabel, setLastUpdateLabel] = React.useState("");
  const [sensor, setSensor] = React.useState({});
  const [relay, setRelay] = React.useState({});
  const [target, setTarget] = React.useState({});
  const [targetUpdating, setTargetUpdating] = React.useState(false);

  React.useEffect(() => {
    const intervalId = setInterval(
      () =>
        setLastUpdateLabel(
          humanizeDuration(Date.now() - lastUpdateAt, {
            language: "fr",
            round: true,
          })
        ),
      1000
    );
    return () => {
      clearInterval(intervalId);
    };
  }, [lastUpdateAt]);

  const queryData = React.useCallback(() => {
    fetch("/api")
      .then(r => r.json())
      .then(data => {
        setSensor(data.sensor);
        setRelay(data.relay);
        setTarget(data.target);
        setLastUpdateAt(Date.now());
      });
  }, []);

  React.useEffect(() => {
    queryData();
  }, [queryData]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (targetUpdating) return;
      queryData();
    }, 1000 * 60);
    return () => {
      clearInterval(intervalId);
    };
  }, [queryData, targetUpdating]);

  const handleTargetChange = React.useCallback(
    e => {
      if (targetUpdating) return;
      setTargetUpdating(true);
      setTarget(e.target.value);
      fetch("/api", {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ target: e.target.value }),
      })
        .then(r => {
          if (r.status !== 204) {
            throw new Error(`Echec de mise à jour (${r.status})`);
          }
        })
        .catch(e => {
          setTarget(target);
        })
        .finally(() => setTargetUpdating(false));
    },
    [target, targetUpdating]
  );

  return (
    <Container maxWidth="sm">
      <Paper sx={{ padding: 2, marginTop: 2, textAlign: "center" }}>
        {!lastUpdateAt && <CircularProgress />}
        {lastUpdateAt && (
          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ textAlign: "center" }}>
              <Chip
                size="medium"
                color="info"
                label={`${sensor.current} °C`}
                sx={{ fontSize: 22 }}
              />
            </Grid>
            <Grid item xs={6} sx={{ textAlign: "center" }}>
              <Chip
                size="medium"
                color="warning"
                label={relay.current ? "ON" : "OFF"}
                sx={{ fontSize: 22 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Slider
                value={target}
                min={16}
                max={20}
                valueLabelDisplay="off"
                track={false}
                marks={marks}
                onChange={handleTargetChange}
              />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ opacity: 0.4 }}>
                {lastUpdateLabel ? (
                  <span>Dernière MAJ : {lastUpdateLabel}</span>
                ) : (
                  <>&nbsp;</>
                )}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
}

export default App;
